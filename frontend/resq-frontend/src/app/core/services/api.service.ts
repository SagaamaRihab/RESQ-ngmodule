import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

 private baseUrl = environment.apiUrl;

  get evacuationRoute(): string {
    return `${this.baseUrl}/evacuation/route`;
  }
}
