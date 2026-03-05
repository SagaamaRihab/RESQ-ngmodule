import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corridor} from '../models/corridor.model';

@Injectable({ providedIn: 'root' })
export class CorridorsService {
  private baseUrl = 'http://localhost:8080/api/admin/corridors';

   constructor(private http: HttpClient) {}

  // lista corridoi
  getCorridors(): Observable<Corridor[]> {
  return this.http.get<Corridor[]>(this.baseUrl);
}

  //  blocca corridoio
  blockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/block`, {});
  }
  // sblocca corridoio
   unblockCorridor(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/unblock`, {});
  }
}

