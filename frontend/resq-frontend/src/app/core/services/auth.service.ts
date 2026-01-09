import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface SigninResponse {
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ======================
  // SIGN IN
  // ======================
 signin(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.API_URL}/signin`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
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
  }): Observable<any> {
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
}
