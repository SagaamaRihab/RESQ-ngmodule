import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/api/users';
  private baseUrl = 'http://localhost:8080/api/user'; // /me/password

  constructor(private http: HttpClient) {}

  // ===== HEADERS CON TOKEN =====
  private getAuthHeaders() {

    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // ===== UPDATE PROFILO =====
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data,
      this.getAuthHeaders()
    );
  }

  // ===== GET PROFILO =====
  getUserById(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    );
  }

  getMyProfile() {
    return this.http.get('/api/user/me');
  }


  // ===== CAMBIO PASSWORD =====
  changeMyPassword(data: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/me/password`,
      data,
      this.getAuthHeaders()
    );
  }

changeMyEmail(newEmail: string) {
  return this.http.put<any>(
    `${this.baseUrl}/user/email`,
    { newEmail },
    this.getAuthHeaders()
  );
}


deleteMyAccount() {
  return this.http.delete<any>(
    `${this.baseUrl}/me`,
    this.getAuthHeaders()
  );
}




}
