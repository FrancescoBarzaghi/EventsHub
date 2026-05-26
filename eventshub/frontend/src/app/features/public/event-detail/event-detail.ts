import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, FooterComponent],
  templateUrl: './event-detail.html'
})
export class EventDetailComponent implements OnInit {
  event: any = null;
  ticketCount = 1;
  purchaseSuccess = false;
  
  // Modulo Nuova Recensione
  newComment = '';
  newRating = 5;

  reviews = [
    { id: 1, user: 'Marco L.', rating: 5, text: 'Esperienza indimenticabile, organizzazione impeccabile nei minimi dettagli.', date: '2025-02-14' },
    { id: 2, user: 'Elena V.', rating: 4, text: 'Ottima musica e acustica perfetta, unica pecca la fila all’ingresso.', date: '2025-02-12' }
  ];

  allEvents = [
    { id: 1, title: 'Festival Jazz Italiano 2025', category: 'Musica', date: '2025-06-15', location: 'Milano, Teatro Nazionale', price: 45, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', rating: 4.8, organizer: 'Jazz Prod srl', desc: 'Il più grande festival dedicato al jazz d’autore in Italia. Tre giorni di performance dal vivo con artisti di calibro internazionale, contaminazioni musicali d’avanguardia ed una splendida cornice scenografica.' },
    { id: 2, title: 'Conferenza Tech Innovation', category: 'Tecnologia', date: '2025-05-20', location: 'Roma, Palazzo dei Congressi', price: 120, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', rating: 4.9, organizer: 'Tech Academy', desc: 'Esplora le ultime frontiere dell’Intelligenza Artificiale, dello sviluppo software moderno e del Web3 con relatori d’eccellenza provenienti dalla Silicon Valley.' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.event = this.allEvents.find(e => e.id === id) || this.allEvents[0];
    });
  }

  buyTickets() {
    this.purchaseSuccess = true;
    setTimeout(() => this.purchaseSuccess = false, 4000);
  }

  addReview() {
    if (!this.newComment.trim()) return;
    this.reviews.unshift({
      id: Date.now(),
      user: 'Tu (Profilo Corrente)',
      rating: this.newRating,
      text: this.newComment,
      date: new Date().toISOString().split('T')[0]
    });
    this.newComment = '';
    this.newRating = 5;
  }
}
