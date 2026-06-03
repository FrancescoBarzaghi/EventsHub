import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolveCodespacesServiceUrl } from './url-utils';

export interface EventData {
  id?: number;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  price: number;
  total_slots: number;
  available_slots?: number;
  image_path?: string;
  sold?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${resolveCodespacesServiceUrl(5000)}/api/events`;

  constructor(private http: HttpClient) {}

  getEvents(filters?: { location?: string; category?: string; max_price?: number; start_date?: string }): Observable<EventData[]> {
    let params = new URLSearchParams();
    if (filters) {
      if (filters.location) params.append('location', filters.location);
      if (filters.category) params.append('category', filters.category);
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.start_date) params.append('start_date', filters.start_date);
    }
    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;
    return this.http.get<EventData[]>(url);
  }

  getEventDetail(eventId: number): Observable<EventData> {
    return this.http.get<EventData>(`${this.apiUrl}/${eventId}`);
  }

  createEvent(eventData: EventData, image?: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('date', eventData.date);
    formData.append('location', eventData.location);
    formData.append('category', eventData.category);
    formData.append('price', eventData.price.toString());
    formData.append('total_slots', eventData.total_slots.toString());

    if (image) {
      formData.append('image', image);
    }

    return this.http.post<any>(this.apiUrl, formData);
  }

  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${eventId}`);
  }

  updateEvent(eventId: number, eventData: EventData): Observable<EventData> {
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('date', eventData.date);
    formData.append('location', eventData.location);
    formData.append('category', eventData.category);
    formData.append('price', eventData.price.toString());
    formData.append('total_slots', eventData.total_slots.toString());

    return this.http.put<EventData>(`${this.apiUrl}/${eventId}`, formData);
  }
}