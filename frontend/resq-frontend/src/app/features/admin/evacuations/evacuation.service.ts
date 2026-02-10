import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvacuationResponse {
  path: string[];
  message: string;
  blockedCorridors?: string[];
}

@Injectable({ providedIn: 'root' })
export class EvacuationService {
  private baseUrl = 'http://localhost:8080/api/evacuation';

  constructor(private http: HttpClient) {}

  compute(startNode: string): Observable<EvacuationResponse> {
    return this.http.get<EvacuationResponse>(
      `${this.baseUrl}/from/${encodeURIComponent(startNode)}`
    );
  }
}
