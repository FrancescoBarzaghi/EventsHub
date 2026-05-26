import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './auth.html'
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';

  // Campi Moduli
  email = '';
  password = '';
  name = '';
  role: 'user' | 'organizer' = 'user';

  constructor(private router: Router) {}

  submitAuth() {
    console.log('Autenticazione inviata con successo:', { email: this.email, activeTab: this.activeTab });
    this.router.navigate(['/']);
  }
}
