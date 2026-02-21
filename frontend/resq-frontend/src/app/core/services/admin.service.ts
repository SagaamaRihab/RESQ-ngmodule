import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corridor } from '../models/corridor.model';
import { environment } from '../../environments/environments';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL = environment.apiUrl + '/map';

  constructor(private http: HttpClient) {}

  getCorridors(): Observable<Corridor[]> {
    return this.http.get<Corridor[]>(`${this.API_URL}/corridors`);
  }

  blockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/corridor/${id}/block`, {});
  }

  unblockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/corridor/${id}/unblock`, {});
  }
}