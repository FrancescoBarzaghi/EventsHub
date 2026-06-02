import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { EventCardComponent } from '../../../shared/components/event-card/event-card';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { resolveCodespacesServiceUrl } from '../../../core/services/url-utils';

const BACKEND_API_BASE = resolveCodespacesServiceUrl(5000);

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, LucideAngularModule, EventCardComponent, FooterComponent],
  templateUrl: './homepage.html'
})
export class HomepageComponent implements OnInit {
  featuredEvents: any[] = [];
  trendingEvents: any[] = [];
  categories: string[] = [];
  loading = true;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.http.get<any[]>(`${BACKEND_API_BASE}/api/events`).subscribe({
      next: (data) => {
        const sortedEvents = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.featuredEvents = sortedEvents.slice(0, 3).map(evt => this.normalizeEvent(evt));
        this.trendingEvents = sortedEvents.slice(3, 6).map(evt => this.normalizeEvent(evt));
        this.categories = Array.from(new Set(sortedEvents.map(evt => evt.category))).sort();
      },
      error: (err) => {
        console.error('Errore caricamento eventi:', err);
        this.errorMessage = 'Impossibile caricare gli eventi. Riprova più tardi.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  normalizeEvent(event: any) {
    return {
      id: event.id,
      title: event.title,
      category: event.category,
      date: event.date,
      location: event.location,
      price: event.price,
      image: event.image_path || event.image,
      rating: event.rating ?? 0
    };
  }
}
