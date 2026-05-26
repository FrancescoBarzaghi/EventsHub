import { Component } from '@angular/typescript';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FooterComponent],
  templateUrl: './profile.html'
})
export class ProfileComponent {
  name = 'Mario Rossi';
  email = 'mario.rossi@esempio.com';
  company = 'Privato Cittadino';
  notificationEnabled = true;
  saveSuccess = false;

  saveProfile() {
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }
}

