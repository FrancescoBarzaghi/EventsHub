import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { resolveCodespacesServiceUrl } from '../services/url-utils';

const BACKEND_API_BASE = resolveCodespacesServiceUrl(5000);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  console.log(`🔍 JWT Interceptor - ${req.method} ${req.url}`, {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'MANCANTE'
  });

  // Allega il token a tutte le chiamate verso il backend Flask (porta 5000)
  const isBackendCall = req.url.startsWith(BACKEND_API_BASE);

  let authReq = req;
  if (token && isBackendCall) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Token allegato alla richiesta: Bearer ${token.substring(0, 30)}...`);
  } else if (!token) {
    console.log(`⚠️ NESSUN TOKEN nel localStorage - richiesta senza autorizzazione`);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`❌ Errore HTTP ${error.status}:`, error);

      if (error.status === 401) {
        const errorMsg = error.error?.error || '';
        console.warn(`401 Error Message: "${errorMsg}"`);

        if (errorMsg.includes('token') || errorMsg.includes('scaduto') || errorMsg.includes('autorizzazione')) {
          console.log(`🔐 Token scaduto - logout e redirect a /auth`);
          localStorage.clear();
          router.navigate(['/auth']);
        }
      }
      return throwError(() => error);
    })
  );
};