import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private readonly API_URL = environment.apiUrl + '/auth';
  constructor(private http: HttpClient) {}

  // ======================
  // SIGN IN
  // ======================
 signin(data: { email: string; password: string }) {
  return this.http.post<any>(`${this.API_URL}/signin`, data).pipe(
    tap(res => {

      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      if (res.id !== undefined && res.id !== null) {
        localStorage.setItem('userId', String(res.id));
      }

      if (res.role) {
        localStorage.setItem('role', String(res.role));
      }

      if (res.username) {
        localStorage.setItem('username', String(res.username));
      }

      if (res.email) {
        localStorage.setItem('email', String(res.email));
      }

    })
  );
}




  // ======================
  // SIGN UP
  // ======================
  signup(data: {
    email: string;
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
    adminKey?: string;
  }) {
    return this.http.post(`${this.API_URL}/signup`, data);
  }

  // ======================
  // SESSION
  // ======================
  logout(): void {
    localStorage.clear();
  }

  isLogged(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}
