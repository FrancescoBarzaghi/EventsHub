import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private clientId = 'eventhub-frontend'; 

  // URL FISSI E CORRETTI PER IL TUO CODESPACE ATTUALE
  private keycloakTokenUrl = 'https://turbo-space-waffle-7v795j7r79rq3r5jg-8080.app.github.dev/realms/EventHub/protocol/openid-connect/token';
  private flaskApiUrl = 'https://turbo-space-waffle-7v795j7r79rq3r5jg-5000.app.github.dev/api/auth/register';

  private currentUserSubject = new BehaviorSubject<UserState | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedSession = localStorage.getItem('eventhub_session');
    if (savedSession) {
      this.currentUserSubject.next(JSON.parse(savedSession));
    }
  }

  public get currentUserValue(): UserState | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    // URLSearchParams forza il browser a formattare il body a basso livello 
    // evitando bug di parsing legati alle librerie interne di Angular
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('grant_type', 'password');
    body.set('username', credentials.username.trim()); // Pulisce eventuali spazi vuoti accidentali
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(this.keycloakTokenUrl, body.toString(), { headers }).pipe(
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