import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { AuthService } from '../../../core/services/auth'; 

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    LucideAngularModule, 
    FooterComponent
  ],
  templateUrl: './auth.html'
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';

  // Campi Moduli (legati con [(ngModel)] al tuo HTML)
  email = '';
  password = '';
  name = '';
  role: 'user' | 'organizer' = 'user';

  // Gestione stati grafici di feedback
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Forza il cambio di tab e pulisce gli errori precedenti
  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  submitAuth(): void {
    this.errorMessage = '';
    
    // Validazione base prima dell'invio
    if (!this.email || !this.password) {
      this.errorMessage = 'Per favore, compila tutti i campi obbligatori.';
      return;
    }

    this.isLoading = true;

    if (this.activeTab === 'login') {
      // -------------------------------
      // FLUSSO DI LOGIN (Via API Keycloak)
      // -------------------------------
      this.authService.login({ username: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Credenziali non valide. Riprova.';
          console.error('Errore Login Keycloak:', err);
        }
      });

    } else {
      // -------------------------------
      // FLUSSO DI REGISTRAZIONE (Via Flask Backend)
      // -------------------------------
      const registrationPayload = {
        username: this.email.split('@')[0], 
        email: this.email,
        password: this.password,
        name: this.name,
        role: this.role
      };

      this.authService.register(registrationPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          // Switch automatico sul tab di login
          this.activeTab = 'login';
          this.errorMessage = "Registrazione avvenuta con successo! Ora puoi effettuare l'accesso.";
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Errore durante la registrazione. Riprova.';
          console.error('Errore Registrazione Flask:', err);
        }
      });
    }
  }
}