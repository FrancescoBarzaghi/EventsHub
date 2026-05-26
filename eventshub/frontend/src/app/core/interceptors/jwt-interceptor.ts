import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Utilizziamo la chiave 'access_token' che verrà popolata dal tuo form di login con Keycloak
  const token = localStorage.getItem('access_token');

  // Se siamo loggati, cloniamo la richiesta inserendo l'Header di autorizzazione
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // Catturiamo gli errori: se Flask risponde 401 (Token scaduto o invalido), ripuliamo e rimandiamo al form
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/auth']); // Rimanda alla tua rotta della pagina auth grafica
      }
      return throwError(() => error);
    })
  );
};