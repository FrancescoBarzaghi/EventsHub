import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule, LucideAngularModule, FooterComponent],
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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadEvent(id);
      }
    });
  }

  loadEvent(eventId: number) {
    this.http.get<any>(`/api/events/${eventId}`).subscribe({
      next: (data) => {
        this.event = {
          id: data.id,
          title: data.title,
          desc: data.description,
          category: data.category,
          date: data.date,
          location: data.location,
          organizer: data.organizer_id || 'Organizzatore',
          price: data.price,
          image: data.image_path,
          available_slots: data.available_slots,
          total_slots: data.total_slots
        };
      },
      error: (err) => {
        console.error('Errore caricamento evento:', err);
      }
    });
  }

  buyTickets() {
    if (!this.event?.id) {
      return;
    }

    this.http.post('/api/tickets', { event_id: this.event.id }).subscribe({
      next: () => {
        this.purchaseSuccess = true;
        setTimeout(() => this.purchaseSuccess = false, 4000);
      },
      error: (err) => {
        console.error('Errore durante l’acquisto:', err);
      }
    });
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
