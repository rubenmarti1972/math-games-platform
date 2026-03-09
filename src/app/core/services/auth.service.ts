import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

/** Respuesta de Strapi al hacer login o registro */
export interface RespuestaAuth {
  jwt: string;
  user: UsuarioAuth;
}

/** Datos del usuario autenticado */
export interface UsuarioAuth {
  id: number;
  username: string;
  email: string;
}

const CLAVE_JWT = 'auth_jwt';
const CLAVE_USUARIO = 'auth_usuario';

/** Servicio de autenticación conectado a Strapi */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Signal con el usuario actual (null si no autenticado) */
  private readonly _usuario = signal<UsuarioAuth | null>(this.cargarUsuarioGuardado());

  /** Signal pública de sólo lectura */
  readonly usuario = this._usuario.asReadonly();

  /** Computed: true si el usuario está autenticado */
  readonly autenticado = computed(() => this._usuario() !== null);

  /** Inicia sesión con email y contraseña */
  login(identificador: string, contrasena: string): Observable<RespuestaAuth> {
    return this.api.post<RespuestaAuth>('/api/auth/local', {
      identifier: identificador,
      password: contrasena
    }).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  /** Registra un nuevo usuario */
  registro(username: string, email: string, contrasena: string): Observable<RespuestaAuth> {
    return this.api.post<RespuestaAuth>('/api/auth/local/register', {
      username,
      email,
      password: contrasena
    }).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  /** Cierra la sesión y redirige al home */
  logout(): void {
    localStorage.removeItem(CLAVE_JWT);
    localStorage.removeItem(CLAVE_USUARIO);
    this._usuario.set(null);
    void this.router.navigateByUrl('/');
  }

  /** Devuelve el JWT almacenado (null si no existe) */
  obtenerJwt(): string | null {
    return localStorage.getItem(CLAVE_JWT);
  }

  /** Guarda JWT y usuario en localStorage y actualiza el signal */
  private guardarSesion(respuesta: RespuestaAuth): void {
    localStorage.setItem(CLAVE_JWT, respuesta.jwt);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.user));
    this._usuario.set(respuesta.user);
  }

  /** Carga el usuario desde localStorage al arrancar la app */
  private cargarUsuarioGuardado(): UsuarioAuth | null {
    try {
      const raw = localStorage.getItem(CLAVE_USUARIO);
      return raw ? (JSON.parse(raw) as UsuarioAuth) : null;
    } catch {
      return null;
    }
  }
}
