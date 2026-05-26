import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { 
  provideLucideIcons, 
  Calendar, User, LogOut, Home, Search, Ticket, Star, Settings, 
  BarChart3, PlusCircle, Shield, Menu, X, MapPin, Clock, Users, 
  Download, Filter, ChevronDown, Edit, Trash2, Eye, TrendingUp, 
  DollarSign, FileText, Flag, UserCog, QrCode, Upload, Mail, Lock, Moon, Sun 
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideLucideIcons({ 
      Calendar, User, LogOut, Home, Search, Ticket, Star, Settings, 
      BarChart3, PlusCircle, Shield, Menu, X, MapPin, Clock, Users, 
      Download, Filter, ChevronDown, Edit, Trash2, Eye, TrendingUp, 
      DollarSign, FileText, Flag, UserCog, QrCode, Upload, Mail, Lock, Moon, Sun 
    })
  ]
};
