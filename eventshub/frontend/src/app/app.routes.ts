import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/homepage/homepage').then(m => m.HomepageComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/public/search/search').then(m => m.SearchComponent)
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./features/public/event-detail/event-detail').then(m => m.EventDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/public/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'user/dashboard',
    loadComponent: () => import('./features/user/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'user/profile',
    loadComponent: () => import('./features/user/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: 'organizer/dashboard-stats',
    loadComponent: () => import('./features/organizer/dashboard-stats/dashboard-stats').then(m => m.DashboardStatsComponent)
  },
  {
    path: 'organizer/event-crud',
    loadComponent: () => import('./features/organizer/event-crud/event-crud').then(m => m.EventCrudComponent)
  },
  {
    path: 'admin/moderation',
    loadComponent: () => import('./features/admin/moderation/moderation').then(m => m.ModerationComponent)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users').then(m => m.UsersComponent)
  },
  { path: '**', redirectTo: '' }
];
