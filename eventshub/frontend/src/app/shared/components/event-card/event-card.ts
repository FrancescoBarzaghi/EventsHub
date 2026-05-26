import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './event-card.html'
})
export class EventCardComponent {
  @Input({ required: true }) event!: {
    id: number;
    title: string;
    category: string;
    date: string;
    location: string;
    price: number;
    image: string;
    rating: number;
  };
}