import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

export interface AuthResponse {
  id: number;
  username: string;
  adresse?: string;
  role?: string;
  message: string;
}

export interface UserCredentials {
  username: string;
  password: string;
  adresse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

register(credentials: UserCredentials): Observable<AuthResponse> {
    const hashedCredentials = {
      username: credentials.username,
      password: this.hashPassword(credentials.password),
      adresse: credentials.adresse
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, hashedCredentials)
      .pipe(
        tap(response => {
          this.saveUserToStorage(response);
          this.currentUserSubject.next(response);
        })
      );
  }

login(credentials: UserCredentials): Observable<AuthResponse> {
    const hashedCredentials = {
      username: credentials.username,
      password: this.hashPassword(credentials.password)
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, hashedCredentials)
      .pipe(
        tap(response => {
          this.saveUserToStorage(response);
          this.currentUserSubject.next(response);
        })
      );
  }

logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

private saveUserToStorage(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

private getUserFromStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

checkUsername(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/check/${username}`);
  }
}
