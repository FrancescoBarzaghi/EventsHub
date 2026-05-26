import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <app-navbar></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {}