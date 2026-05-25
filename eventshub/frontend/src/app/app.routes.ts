import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Rotta per l'autenticazione con il tuo percorso reale
  { 
    path: 'auth', 
    loadComponent: () => import('./features/public/auth/auth').then(m => m.Auth) 
  },
  
  // Reindirizzamenti automatici
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];