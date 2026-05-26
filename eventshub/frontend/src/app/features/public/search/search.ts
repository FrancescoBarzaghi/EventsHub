import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { EventCard} from '../../../shared/components/event-card/event-card';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, EventCard, FooterComponent],
  templateUrl: './search.html'
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'Tutte';
  selectedPrice = 'Tutti';
  selectedLocation = 'Tutte';

  categories = ['Tutte', 'Musica', 'Tecnologia', 'Gastronomia', 'Arte', 'Sport', 'Teatro'];
  locations = ['Tutte', 'Milano', 'Roma', 'Firenze', 'Venezia', 'Verona'];

  allEvents = [
    { id: 1, title: 'Festival Jazz Italiano 2025', category: 'Musica', date: '2025-06-15', location: 'Milano', price: 45, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', rating: 4.8 },
    { id: 2, title: 'Conferenza Tech Innovation', category: 'Tecnologia', date: '2025-05-20', location: 'Roma', price: 120, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', rating: 4.9 },
    { id: 3, title: 'Workshop Cucina Vegana', category: 'Gastronomia', date: '2025-05-10', location: 'Firenze', price: 75, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', rating: 4.7 },
    { id: 4, title: 'Mostra Arte Contemporanea', category: 'Arte', date: '2025-07-02', location: 'Venezia', price: 0, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', rating: 4.5 },
    { id: 5, title: 'Maratona di Roma 2025', category: 'Sport', date: '2025-04-12', location: 'Roma', price: 50, image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800', rating: 4.6 },
    { id: 6, title: 'Teatro: La Traviata', category: 'Teatro', date: '2025-09-05', location: 'Verona', price: 95, image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', rating: 4.9 }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
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

