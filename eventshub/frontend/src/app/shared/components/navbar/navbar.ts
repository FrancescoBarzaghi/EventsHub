import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  currentRole: 'public' | 'user' | 'organizer' | 'admin' = 'public';
  mobileMenuOpen = false;
  darkMode = false;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setRole(role: any) {
    this.currentRole = role;
  }

  logout() {
    this.currentRole = 'public';
  }
}