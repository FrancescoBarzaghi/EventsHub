import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FooterComponent],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  name = '';
  email = '';
  company = '';
  notificationEnabled = true;
  saveSuccess = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      // Il token Keycloak salva l'email come username nel login
      // e i dati completi sono nel token JWT decodificato
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Decodifica il payload del JWT (parte centrale in base64)
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.name = payload.name || payload.preferred_username || user.username;
          this.email = payload.email || user.username;
        } catch {
          this.name = user.username;
          this.email = user.username;
        }
      } else {
        this.name = user.username;
        this.email = user.username;
      }
    }
  }

  saveProfile() {
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }
}