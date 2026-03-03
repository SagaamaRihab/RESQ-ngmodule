import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EvacuationResponse } from '../models/evacuation-response.model';



@Injectable({
  providedIn: 'root'
})
export class EvacuationService {

  private readonly apiUrl = environment.apiUrl + '/evacuation';

  getNodes(building: string, floorCode: string) {
  return this.http.get<any[]>(
    `/api/nodes/${building}/${floorCode}`
  );
}

  constructor(private http: HttpClient) {
     console.log('ENV API URL:', environment.apiUrl);
  }

 calculateEvacuation(startNode: string) {
  return this.http.get<EvacuationResponse>(
    `http://localhost:8080/api/evacuation/from/${encodeURIComponent(startNode)}`
  );
}
}
