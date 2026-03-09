import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Campos del formulario */
  readonly nombre = signal('');
  readonly email = signal('');
  readonly contrasena = signal('');
  readonly confirmar = signal('');

  /** Estado de la petición */
  readonly cargando = signal(false);
  readonly error = signal('');

  enviarRegistro(): void {
    if (!this.nombre() || !this.email() || !this.contrasena()) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }

    if (this.contrasena() !== this.confirmar()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.contrasena().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.authService.registro(this.nombre(), this.email(), this.contrasena()).subscribe({
      next: () => void this.router.navigateByUrl('/games'),
      error: (err) => {
        const mensaje = err?.error?.error?.message ?? 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        this.error.set(mensaje);
        this.cargando.set(false);
      }
    });
  }
}
