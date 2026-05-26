import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Importiamo l'interceptor funzionale situato nella tua cartella core
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';

import { LucideAngularModule, 
  Calendar, User, LogOut, Home, Search, Ticket, Star, Settings, 
  BarChart3, PlusCircle, Shield, Menu, X, MapPin, Clock, Users, 
  Download, Filter, ChevronDown, Edit, Trash2, Eye, TrendingUp, 
  DollarSign, FileText, Flag, UserCog, QrCode, Upload, Mail, Lock, Moon, Sun,
  ArrowRight 
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Configura il client HTTP usando il sistema di interceptor moderno (funzionale) 
    // per iniettare il token dal localStorage a ogni chiamata verso Flask
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    // Imposta la lingua italiana a livello globale
    { provide: LOCALE_ID, useValue: 'it-IT' },

    // Modulo per le tue icone Lucide (completamente intatto)
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Calendar, User, LogOut, Home, Search, Ticket, Star, Settings, 
        BarChart3, PlusCircle, Shield, Menu, X, MapPin, Clock, Users, 
        Download, Filter, ChevronDown, Edit, Trash2, Eye, TrendingUp, 
        DollarSign, FileText, Flag, UserCog, QrCode, Upload, Mail, Lock, Moon, Sun,
        ArrowRight
      })
    )
  ]
};