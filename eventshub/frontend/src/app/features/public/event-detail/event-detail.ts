import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { AuthService } from '../../../core/services/auth';
import { resolveCodespacesServiceUrl } from '../../../core/services/url-utils';

const BACKEND_API_BASE = resolveCodespacesServiceUrl(5000);

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
  loading = true;
  errorMessage = '';
  reviewError = '';
  reviewSuccess = '';
  reviews: any[] = [];

  // Modulo Nuova Recensione
  newComment = '';
  newRating = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadEvent(id);
        this.loadReviews(id);
      }
    });
  }

  loadEvent(eventId: number) {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(`${BACKEND_API_BASE}/api/events/${eventId}`).subscribe({
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
        this.errorMessage = 'Impossibile caricare i dettagli dell\'evento. Riprova più tardi.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  buyTickets() {
    if (!this.event?.id) {
      return;
    }

    // Controllo autenticazione
    if (!this.authService.currentUserValue) {
      this.errorMessage = 'Devi essere loggato per acquistare i biglietti.';
      this.router.navigate(['/auth']);
      return;
    }

    this.http.post(`${BACKEND_API_BASE}/api/tickets`, { event_id: this.event.id }).subscribe({
      next: () => {
        this.purchaseSuccess = true;
        setTimeout(() => this.purchaseSuccess = false, 4000);
        // Dopo l'acquisto, mostra il biglietto nell'area personale
        this.router.navigate(['/user/dashboard']);
      },
      error: (err) => {
        console.error('Errore durante l\'acquisto:', err);
        if (err.status === 401) {
          this.errorMessage = 'Sessione scaduta. Per favore effettua di nuovo il login.';
          this.authService.logout();
          this.router.navigate(['/auth']);
        } else {
          this.errorMessage = err.error?.error || 'Errore durante l\'acquisto. Riprova.';
        }
      }
    });
  }

  loadReviews(eventId: number) {
    this.reviewError = '';
    this.http.get<any[]>(`${BACKEND_API_BASE}/api/reviews/event/${eventId}`).subscribe({
      next: (reviews) => {
        this.reviews = reviews.map(r => ({
          id: r.id,
          user: r.user_id,
          rating: r.rating,
          text: r.comment,
          date: r.created_at
        }));
      },
      error: (err) => {
        console.error('Errore caricamento recensioni:', err);
        this.reviewError = 'Impossibile caricare i commenti dell\'evento.';
      }
    });
  }

  addReview() {
    if (!this.newComment.trim()) {
      return;
    }
    if (!this.event?.id) {
      return;
    }

    // Controllo autenticazione
    if (!this.authService.currentUserValue) {
      this.reviewError = 'Devi essere loggato per lasciare un commento.';
      this.router.navigate(['/auth']);
      return;
    }

    this.reviewError = '';
    this.reviewSuccess = '';

    this.http.post(`${BACKEND_API_BASE}/api/reviews`, {
      event_id: this.event.id,
      rating: this.newRating,
      comment: this.newComment.trim()
    }).subscribe({
      next: () => {
        this.reviewSuccess = 'Commento aggiunto con successo!';
        this.newComment = '';
        this.newRating = 5;
        this.loadReviews(this.event.id);
      },
      error: (err) => {
        console.error('Errore invio commento:', err);
        if (err.status === 401) {
          this.reviewError = 'Sessione scaduta. Per favore effettua di nuovo il login.';
          this.authService.logout();
          this.router.navigate(['/auth']);
        } else {
          this.reviewError = err.error?.error || err.error?.message || 'Impossibile inviare il commento.';
        }
      }
    });
  }
}
