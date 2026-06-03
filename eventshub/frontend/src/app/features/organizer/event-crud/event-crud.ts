import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { EventService, EventData } from '../../../core/services/event';

@Component({
  selector: 'app-event-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FooterComponent],
  templateUrl: './event-crud.html'
})
export class EventCrudComponent implements OnInit {
  eventsList: EventData[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  selectedImage: File | null = null;

  // Form fields
  title = '';
  description = '';
  category = 'Musica';
  date = '';
  time = '19:00';
  location = '';
  price = 0;
  total_slots = 50;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadEvents();
  }

  /**
   * Carica gli eventi dall'API
   */
  loadEvents() {
    this.isLoading = true;
    this.error = null;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.eventsList = events;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli eventi:', err);
        this.error = 'Impossibile caricare gli eventi. Riprova più tardi.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Gestisce la selezione dell'immagine
   */
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validazione semplice
      if (!file.type.startsWith('image/')) {
        this.error = 'Seleziona un file immagine valido.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.error = 'L\'immagine non può superare 5MB.';
        return;
      }
      this.selectedImage = file;
      this.error = null;
    }
  }

  /**
   * Aggiunge un nuovo evento
   */
  addEvent() {
    // Validazione
    if (!this.title.trim() || !this.description.trim() || !this.date || !this.location.trim()) {
      this.error = 'Compila tutti i campi obbligatori.';
      return;
    }

    if (this.total_slots <= 0) {
      this.error = 'Il numero di posti deve essere maggiore di 0.';
      return;
    }

    // Combina data e ora nel formato atteso dal backend: YYYY-MM-DD HH:MM
    const dateTime = `${this.date} ${this.time}`;

    const eventData: EventData = {
      title: this.title,
      description: this.description,
      date: dateTime,
      location: this.location,
      category: this.category,
      price: this.price,
      total_slots: this.total_slots
    };

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.eventService.createEvent(eventData, this.selectedImage || undefined).subscribe({
      next: (response) => {
        // Ricarica la lista degli eventi dal backend
        this.loadEvents();
        
        // Resetta il form
        this.title = '';
        this.description = '';
        this.date = '';
        this.time = '19:00';
        this.location = '';
        this.price = 0;
        this.total_slots = 50;
        this.category = 'Musica';
        this.selectedImage = null;

        this.successMessage = 'Evento creato con successo!';
        this.isLoading = false;

        // Nascondi il messaggio di successo dopo 3 secondi
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Errore nella creazione dell\'evento:', err);
        this.error = err.error?.error || 'Errore nella creazione dell\'evento. Riprova.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Elimina un evento
   */
  deleteEvent(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      this.isLoading = true;
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.eventsList = this.eventsList.filter(e => e.id !== id);
          this.successMessage = 'Evento eliminato con successo.';
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Errore nell\'eliminazione dell\'evento:', err);
          this.error = 'Errore nell\'eliminazione dell\'evento. Riprova.';
          this.isLoading = false;
        }
      });
    }
  }
}