import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Utilizziamo la chiave 'access_token' che verrà popolata dal tuo form di login con Keycloak
  const token = localStorage.getItem('access_token');

  // Debug: log della richiesta
  console.log(`🔍 JWT Interceptor - ${req.method} ${req.url}`, {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'MANCANTE'
  });

  // Se siamo loggati, cloniamo la richiesta inserendo l'Header di autorizzazione
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Token allegato alla richiesta: Bearer ${token.substring(0, 30)}...`);
  } else {
    console.log(`⚠️ NESSUN TOKEN nel localStorage - richiesta senza autorizzazione`);
  }

  // Catturiamo gli errori: se Flask risponde 401 (Token scaduto o invalido), ripuliamo e rimandiamo al form
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`❌ Errore HTTP ${error.status}:`, error);
      
      if (error.status === 401) {
        // Solo se il token è effettivamente invalido/scaduto (non per autorizzazione insufficiente)
        // Verifichiamo il messaggio di errore dal backend
        const errorMsg = error.error?.error || '';
        console.warn(`401 Error Message: "${errorMsg}"`);
        
        if (errorMsg.includes('token') || errorMsg.includes('scaduto') || errorMsg.includes('autorizzazione')) {
          console.log(`🔐 Token scaduto - logout e redirect a /auth`);
          localStorage.clear();
          router.navigate(['/auth']);
        }
      }
      // Non lanciamo il redirect automatico - lasciamo che il componente gestisca l'errore
      return throwError(() => error);
    })
  );
};