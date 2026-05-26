import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-event-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FooterComponent],
  templateUrl: './event-crud.html'
})
export class EventCrudComponent {
  eventsList = [
    { id: 1, title: 'Festival Jazz Italiano 2025', category: 'Musica', date: '2025-06-15', price: 45, sold: 84 },
    { id: 2, title: 'Conferenza Tech Innovation', category: 'Tecnologia', date: '2025-05-20', price: 120, sold: 58 }
  ];

  title = '';
  category = 'Musica';
  date = '';
  price = 0;

  addEvent() {
    if (!this.title.trim() || !this.date) return;
    this.eventsList.push({
      id: Date.now(),
      title: this.title,
      category: this.category,
      date: this.date,
      price: this.price,
      sold: 0
    });
    this.title = '';
    this.date = '';
    this.price = 0;
  }

  deleteEvent(id: number) {
    this.eventsList = this.eventsList.filter(e => e.id !== id);
  }
}