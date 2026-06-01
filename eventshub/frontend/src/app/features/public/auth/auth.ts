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

  email = '';
  password = '';
  name = '';
  role: 'user' | 'organizer' = 'user';

  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  submitAuth(): void {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Per favore, compila tutti i campi obbligatori.';
      return;
    }

    if (this.activeTab === 'register' && !this.name) {
      this.errorMessage = 'Per favore, inserisci il tuo nome completo.';
      return;
    }

    this.isLoading = true;

    if (this.activeTab === 'login') {
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
      const registrationPayload = {
        username: this.email, 
        email: this.email,
        password: this.password,
        name: this.name,
        role: this.role
      };

      this.authService.register(registrationPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.activeTab = 'login';
          this.errorMessage = "Registrazione avvenuta con successo! Ora puoi effettuare l'accesso.";
          this.email = '';
          this.password = '';
          this.name = '';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Errore durante la registrazione. Riprova o controlla se l\'utente esiste già.';
          console.error('Errore Registrazione Flask:', err);
        }
      });
    }
  }
}