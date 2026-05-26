import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  // Elenco biglietti acquistati mock
  tickets = [
    { id: 101, title: 'Festival Jazz Italiano 2025', date: '2025-06-15', location: 'Milano, Teatro Nazionale', qty: 2, total: 90, code: 'TKT-JAZZ-9938', status: 'Valido' },
    { id: 102, title: 'Conferenza Tech Innovation', date: '2025-05-20', location: 'Roma, Palazzo dei Congressi', qty: 1, total: 120, code: 'TKT-TECH-1102', status: 'Valido' }
  ];

  selectedTicket: any = null;

  openQrModal(ticket: any) {
    this.selectedTicket = ticket;
  }

  closeQrModal() {
    this.selectedTicket = null;
  }
}

