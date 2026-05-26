import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-organizer-stats',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './dashboard-stats.html'
})
export class DashboardStatsComponent {
  stats = {
    totalRevenue: '4,850',
    ticketsSold: '142',
    activeEvents: '3',
    conversionRate: '12.4'
  };

  recentSales = [
    { id: 1, user: 'mario.rossi@email.com', event: 'Festival Jazz 2025', qty: 2, price: 90, date: 'Oggi, 14:32' },
    { id: 2, user: 'luca.bianchi@email.com', event: 'Tech Innovation', qty: 1, price: 120, date: 'Ieri, 18:11' },
    { id: 3, user: 'giulia.verdi@email.com', event: 'Festival Jazz 2025', qty: 1, price: 45, date: '24 Mag, 09:15' }
  ];
}