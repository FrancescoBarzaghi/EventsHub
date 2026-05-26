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
  
  // URL pubblico del tuo Keycloak su GitHub Codespaces
  private keycloakTokenUrl = 'https://reimagined-space-fishstick-976977wq669vf7r4r-8080.app.github.dev/realms/EventHub/protocol/openid-connect/token';
  private clientId = 'eventhub-frontend'; 

  // URL del tuo backend Flask (Presumo la porta standard 5000 configurata su Codespaces)
  private flaskApiUrl = 'https://reimagined-space-fishstick-976977wq669vf7r4r-5000.app.github.dev/api/auth/register';

  // Lo stato globale reattivo dell'applicazione
  private currentUserSubject = new BehaviorSubject<UserState | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Al caricamento della pagina recupera l'eventuale sessione salvata
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
        // Decodifichiamo il JWT per estrarre i ruoli in modo sicuro
        const decoded: any = jwtDecode(res.access_token);
        
        // Estrae sia i ruoli globali del Realm che quelli del Client per evitare problemi di configurazione
        const realmRoles = decoded.realm_access?.roles || [];
        const clientRoles = decoded.resource_access?.[this.clientId]?.roles || [];
        const allRoles = [...new Set([...realmRoles, ...clientRoles])]; // Unisce i ruoli senza duplicati

        const userState: UserState = {
          username: credentials.username,
          roles: allRoles,
          token: res.access_token
        };

        // Salviamo i dati (allineando la chiave con il jwtInterceptor)
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('eventhub_session', JSON.stringify(userState));
        
        // Notifichiamo a tutta l'applicazione il cambio di stato
        this.currentUserSubject.next(userState);
      })
    );
  }

  // Registrazione: manda i dati a Flask, che interagirà con Keycloak tramite l'Admin Client
  register(userData: any): Observable<any> {
    return this.http.post(this.flaskApiUrl, userData);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('eventhub_session');
    this.currentUserSubject.next(null);
  }

  // Verifica se l'utente ha il ruolo necessario (user, organizer, admin)
  hasRole(expectedRole: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(expectedRole) : false;
  }
}