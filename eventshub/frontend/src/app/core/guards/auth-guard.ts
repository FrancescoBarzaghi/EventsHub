import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserValue;

  // Se l'utente non è loggato, dritto alla pagina di login
  if (!currentUser) {
    router.navigate(['/auth']);
    return false;
  }

  // Controlla se la rotta richiede un ruolo specifico inserito nei metadati
  const requiredRole = route.data?.['role'];
  
  if (requiredRole && !currentUser.roles.includes(requiredRole)) {
    // Se non ha i permessi giusti, lo rispediamo in una zona sicura o in home
    router.navigate(['/auth']);
    return false;
  }

  return true;
};