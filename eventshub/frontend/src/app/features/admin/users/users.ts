import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './users.html'
})
export class UsersComponent {
  usersList = [
    { id: 1, name: 'Mario Rossi', email: 'mario.rossi@email.com', role: 'Partecipante', status: 'Attivo' },
    { id: 2, name: 'Organizzatore Jazz srl', email: 'jazz.prod@email.com', role: 'Organizzatore', status: 'Attivo' },
    { id: 3, name: 'Gianluca Verdi', email: 'gian.verdi@email.com', role: 'Partecipante', status: 'Sospeso' }
  ];

  toggleStatus(user: any) {
    user.status = user.status === 'Attivo' ? 'Sospeso' : 'Attivo';
  }
}

