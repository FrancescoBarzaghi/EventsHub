import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FooterComponent],
  templateUrl: './moderation.html'
})
export class ModerationComponent {
  pendingReviews = [
    { id: 1, user: 'mario.rossi@email.com', target: 'Festival Jazz 2025', rating: 2, text: 'Servizio bar pessimo, organizzazione disastrosa e ritardi infiniti.', flag: true },
    { id: 2, user: 'clara.n@email.com', target: 'Tech Innovation', rating: 5, text: 'Relatori eccezionali, argomenti di altissimo valore tecnico.', flag: false }
  ];

  approve(id: number) {
    this.pendingReviews = this.pendingReviews.filter(r => r.id !== id);
  }

  reject(id: number) {
    this.pendingReviews = this.pendingReviews.filter(r => r.id !== id);
  }
}