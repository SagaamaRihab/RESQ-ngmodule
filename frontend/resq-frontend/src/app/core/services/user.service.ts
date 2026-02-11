import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data,
      this.getHeaders()
    );
  }

  getUser(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );
  }

  getUserById(id: number) {
  return this.http.get<any>(
    `${this.apiUrl}/${id}`,
    this.getHeaders()
  );
}





}
