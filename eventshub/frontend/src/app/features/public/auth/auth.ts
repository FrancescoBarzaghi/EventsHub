import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form reattivi dichiarati separatamente
  loginForm: FormGroup;
  registerForm: FormGroup;
  
  // Stato visivo per scambiare i form nella stessa pagina
  isLoginMode = true;
  errorMessage = '';
  successMessage = '';

  constructor() {
    // Inizializzazione modulo di Login con validazioni
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Inizializzazione modulo di Registrazione con validazioni
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required] // 'user' o 'organizer'
    });
  }

  // Cambia tra form Login e Registrazione pulendo i vecchi messaggi
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Gestione dell'invio del Login verso Keycloak
  onLoginSubmit() {
    if (this.loginForm.invalid) return;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Se va a buon fine, reindirizza alla radice dell'app
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = 'Credenziali non valide. Controlla i dati inseriti.';
        console.error(err);
      }
    });
  }

  // Gestione dell'invio della registrazione verso la tua API Flask
  onRegisterSubmit() {
    if (this.registerForm.invalid) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Registrazione completata con successo! Ora puoi accedere.';
        this.isLoginMode = true; // Riporta l'utente sul form di login
        this.registerForm.reset({ role: 'user' });
      },
      error: (err) => {
        this.errorMessage = 'Impossibile registrarsi. Username o Email potrebbero essere già in uso.';
        console.error(err);
      }
    });
  }
}