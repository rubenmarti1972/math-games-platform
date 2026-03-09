import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Campos del formulario */
  readonly email = signal('');
  readonly contrasena = signal('');

  /** Estado de la petición */
  readonly cargando = signal(false);
  readonly error = signal('');

  enviarLogin(): void {
    if (!this.email() || !this.contrasena()) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.authService.login(this.email(), this.contrasena()).subscribe({
      next: () => void this.router.navigateByUrl('/games'),
      error: () => {
        this.error.set('Email o contraseña incorrectos. Inténtalo de nuevo.');
        this.cargando.set(false);
      }
    });
  }
}
