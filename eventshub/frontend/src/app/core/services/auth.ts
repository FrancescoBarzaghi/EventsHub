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
  
  // URL pubblico di Keycloak aggiornato con il dominio attivo di Codespaces
  private keycloakTokenUrl = 'https://super-duper-goldfish-jjr5jj94rqj7h559v-8080.app.github.dev/realms/EventHub/protocol/openid-connect/token';
  private clientId = 'eventhub-frontend'; 

  // URL del backend Flask aggiornato con il dominio attivo di Codespaces
  private flaskApiUrl = 'https://super-duper-goldfish-jjr5jj94rqj7h559v-5000.app.github.dev/api/auth/register';

  // Stato globale reattivo dell'applicazione
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
        const decoded: any = jwtDecode(res.access_token);
        
        const realmRoles = decoded.realm_access?.roles || [];
        const clientRoles = decoded.resource_access?.[this.clientId]?.roles || [];
        const allRoles = [...new Set([...realmRoles, ...clientRoles])];

        const userState: UserState = {
          username: credentials.username,
          roles: allRoles,
          token: res.access_token
        };

        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('eventhub_session', JSON.stringify(userState));
        
        this.currentUserSubject.next(userState);
      })
    );
  }

  // Registrazione utenti reali tramite backend Flask usando JSON standard
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.flaskApiUrl, userData, { headers });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('eventhub_session');
    this.currentUserSubject.next(null);
  }

  hasRole(expectedRole: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(expectedRole) : false;
  }
}