import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvacuationResponse } from '../models/evacuation-response.model';
import { environment } from '../../environments/environments';



@Injectable({
  providedIn: 'root'
})
export class EvacuationService {

  private readonly apiUrl = environment.apiUrl + '/evacuation';

  constructor(private http: HttpClient) {}

  calculateEvacuation(startNode: string): Observable<EvacuationResponse> {
    return this.http.get<EvacuationResponse>(
      `${this.apiUrl}/from/${startNode}`
    );
  }
}
