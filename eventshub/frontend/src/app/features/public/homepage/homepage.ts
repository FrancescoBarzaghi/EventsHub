import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { EventCardComponent } from '../../../shared/components/event-card/event-card';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, EventCardComponent, FooterComponent],
  templateUrl: './homepage.html'
})
export class HomepageComponent {
  // Dati estratti fedelmente dal prototipo
  featuredEvents = [
    { id: 1, title: 'Festival Jazz Italiano 2025', category: 'Musica', date: '2025-06-15', location: 'Milano', price: 45, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', rating: 4.8 },
    { id: 2, title: 'Conferenza Tech Innovation', category: 'Tecnologia', date: '2025-05-20', location: 'Roma', price: 120, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', rating: 4.9 },
    { id: 3, title: 'Workshop Cucina Vegana', category: 'Gastronomia', date: '2025-05-10', location: 'Firenze', price: 75, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', rating: 4.7 }
  ];

  trendingEvents = [
    { id: 4, title: 'Mostra Arte Contemporanea', location: 'Venezia', price: 0, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', category: 'Arte', date: '2025-07-02', rating: 4.5 },
    { id: 5, title: 'Maratona di Roma 2025', location: 'Roma', price: 50, image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800', category: 'Sport', date: '2025-04-12', rating: 4.6 },
    { id: 6, title: 'Teatro: La Traviata', location: 'Verona', price: 95, image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', category: 'Teatro', date: '2025-09-05', rating: 4.9 }
  ];

  categories = ['Musica', 'Tecnologia', 'Gastronomia', 'Arte', 'Sport', 'Teatro'];
}
