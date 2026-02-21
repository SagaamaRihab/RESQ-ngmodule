import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorridorDto } from './corridor.dto';

@Injectable({ providedIn: 'root' })
export class CorridorsService {
  private baseUrl = 'http://localhost:8080/api/map';

  constructor(private http: HttpClient) {}

  // lista corridoi
  getCorridors(): Observable<CorridorDto[]> {
    return this.http.get<CorridorDto[]>(`${this.baseUrl}/corridors`);
  }

  //  blocca corridoio
  blockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/corridor/${id}/block`, {});
  }

  // sblocca corridoio
  unblockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/corridor/${id}/unblock`, {});
  }
}
