import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional que añade el JWT de Strapi
 * al header Authorization de cada petición HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const jwt = authService.obtenerJwt();

  if (!jwt) {
    return next(req);
  }

  const peticionConToken = req.clone({
    setHeaders: { Authorization: `Bearer ${jwt}` }
  });

  return next(peticionConToken);
};
