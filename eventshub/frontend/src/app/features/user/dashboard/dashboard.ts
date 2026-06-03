import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { resolveCodespacesServiceUrl } from '../../../core/services/url-utils';

const BACKEND_API_BASE = resolveCodespacesServiceUrl(5000);

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  tickets: any[] = [];
  selectedTicket: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.http.get<any[]>(`${BACKEND_API_BASE}/api/tickets/my-tickets`).subscribe({
      next: (tickets) => {
        this.tickets = tickets.map(t => ({
          id: t.ticket_id,
          title: t.event.title,
          date: t.event.date,
          location: t.event.location,
          qty: 1,
          total: t.event.price,
          code: t.qr_code_data,
          status: 'Valido'
        }));
      },
      error: (err) => {
        console.error('Errore caricamento biglietti:', err);
      }
    });
  }

  openQrModal(ticket: any) {
    this.selectedTicket = ticket;
  }

  closeQrModal() {
    this.selectedTicket = null;
  }
}