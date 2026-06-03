import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { EventCardComponent } from '../../../shared/components/event-card/event-card';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { resolveCodespacesServiceUrl } from '../../../core/services/url-utils';

const BACKEND_API_BASE = resolveCodespacesServiceUrl(5000);

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, EventCardComponent, FooterComponent],
  templateUrl: './search.html'
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'Tutte';
  selectedPrice = 'Tutti';
  selectedLocation = 'Tutte';

  categories: string[] = ['Tutte'];
  locations = ['Tutte', 'Milano', 'Roma', 'Firenze', 'Venezia', 'Verona'];

  allEvents: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
    this.loadEvents();
  }

  loadEvents() {
    this.http.get<any[]>(`${BACKEND_API_BASE}/api/events`).subscribe({
      next: (events) => {
        this.allEvents = events.map(evt => ({
          id: evt.id,
          title: evt.title,
          category: evt.category,
          date: evt.date,
          location: evt.location,
          price: evt.price,
          image: evt.image_path || evt.image,
          rating: evt.rating ?? 0
        }));

        const uniqueCategories = Array.from(new Set(this.allEvents.map(evt => evt.category))).sort();
        this.categories = ['Tutte', ...uniqueCategories];
      },
      error: (err) => {
        console.error('Errore caricamento eventi di ricerca:', err);
      }
    });
  }

  get filteredEvents() {
    return this.allEvents.filter(event => {
      const matchText = event.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = this.selectedCategory === 'Tutte' || event.category === this.selectedCategory;
      const matchLoc = this.selectedLocation === 'Tutte' || event.location === this.selectedLocation;
      
      let matchPrice = true;
      if (this.selectedPrice === 'Gratis') matchPrice = event.price === 0;
      if (this.selectedPrice === 'Pagamento') matchPrice = event.price > 0;

      return matchText && matchCat && matchLoc && matchPrice;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'Tutte';
    this.selectedPrice = 'Tutti';
    this.selectedLocation = 'Tutte';
  }
}