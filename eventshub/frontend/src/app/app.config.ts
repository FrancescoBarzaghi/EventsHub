import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
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