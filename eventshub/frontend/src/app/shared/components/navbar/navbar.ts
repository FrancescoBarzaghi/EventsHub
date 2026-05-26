import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth'; // Importa il tuo servizio reattivo
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentRole: 'public' | 'user' | 'organizer' | 'admin' = 'public';
  username = '';
  mobileMenuOpen = false;
  darkMode = false;
  
  private authSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Ci iscriviamo allo stato dell'utente per reagire in tempo reale ai cambi di login/logout
    this.authSubscription = this.authService.currentUser$.subscribe({
      next: (userState) => {
        if (userState) {
          this.username = userState.username || 'Utente';
          
          // Mappa la gerarchia dei ruoli in base al token ricevuto dal tuo form custom
          if (userState.roles.includes('admin')) {
            this.currentRole = 'admin';
          } else if (userState.roles.includes('organizer')) {
            this.currentRole = 'organizer';
          } else if (userState.roles.includes('user')) {
            this.currentRole = 'user';
          } else {
            this.currentRole = 'public';
          }
        } else {
          // Se non c'è sessione attiva (utente null), resettiamo la vista a pubblica
          this.currentRole = 'public';
          this.username = '';
        }
      }
    });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // CORRETTO: Ora punta a '/login', esattamente come configurato in app.routes.ts!
  login() {
    this.router.navigate(['/login']); 
  }

  // Esegue il logout distruggendo la sessione locale in modo reattivo
  logout() {
    this.authService.logout();
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    // Buona pratica Angular: annulliamo l'iscrizione per evitare memory leak
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}