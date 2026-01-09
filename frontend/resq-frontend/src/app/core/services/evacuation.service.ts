import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvacuationResponse } from '../models/evacuation-response.model';

@Injectable({
  providedIn: 'root'
})
export class EvacuationService {

  private readonly apiUrl = 'http://localhost:8080/api/evacuation';

  constructor(private http: HttpClient) {}

  calculateEvacuation(startNode: string): Observable<EvacuationResponse> {
    return this.http.get<EvacuationResponse>(
      `${this.apiUrl}/from/${startNode}`
    );
  }
}
