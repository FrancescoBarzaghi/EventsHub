import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface UserState {
  username: string;
  roles: string[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // URL standard del tuo Keycloak locale
  private keycloakTokenUrl = 'http://localhost:8080/realms/eventhub-realm/protocol/openid-connect/token';
  private clientId = 'eventhub-frontend'; 

  // Lo stato globale reattivo dell'applicazione
  private currentUserSubject = new BehaviorSubject<UserState | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Al caricamento della pagina ricupera l'eventuale sessione salvata
    const savedSession = localStorage.getItem('eventhub_session');
    if (savedSession) {
      this.currentUserSubject.next(JSON.parse(savedSession));
    }
  }

  public get currentUserValue(): UserState | null {
    return this.currentUserSubject.value;
  }

  // Scambia le credenziali inserite nel form di Angular direttamente con Keycloak
  login(credentials: { username: string; password: string }): Observable<any> {
    const payload = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', 'password')
      .set('username', credentials.username)
      .set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(this.keycloakTokenUrl, payload.toString(), { headers }).pipe(
      tap(res => {
        // Estraiamo i ruoli associati a questo client decodificando il JWT
        const decoded: any = jwtDecode(res.access_token);
        const roles = decoded.resource_access?.[this.clientId]?.roles || [];

        const userState: UserState = {
          username: credentials.username,
          roles: roles,
          token: res.access_token
        };

        // Salviamo i dati per i prossimi accessi
        localStorage.setItem('eventhub_token', res.access_token);
        localStorage.setItem('eventhub_session', JSON.stringify(userState));
        
        // Notifichiamo a tutta l'applicazione il cambio di stato
        this.currentUserSubject.next(userState);
      })
    );
  }

  // Registrazione: manda i dati a Flask, che interagirà con Keycloak tramite le librerie Admin
  register(userData: any): Observable<any> {
    return this.http.post('http://localhost:5000/api/auth/register', userData);
  }

  logout(): void {
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_session');
    this.currentUserSubject.next(null);
  }

  // Verifica se l'utente ha il ruolo necessario (user, organizer, admin)
  hasRole(expectedRole: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(expectedRole) : false;
  }
}