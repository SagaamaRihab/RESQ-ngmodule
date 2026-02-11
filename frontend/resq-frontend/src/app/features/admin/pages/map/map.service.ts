// src/app/features/admin/map/map.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface NodeDTO {
  label: string;
 
  building?: string;
}

export interface CorridorDTO {
  id: number;
  fromNode: string;
  toNode: string;
  blocked: boolean;
}

export interface MapDTO {
  nodes: NodeDTO[];
  corridors: CorridorDTO[];
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ✅ MAP (nodes + corridors + blocked state)
  getMap(): Observable<MapDTO> {
    return this.http.get<MapDTO>(`${this.baseUrl}/map`);
  }

  // ✅ EVACUATION PATH (backend uses current DB state: blocked corridors excluded)
  
  getEvacuationPath(startNode: string): Observable<string[]> {
    return this.http
      .get<{ path: string[] }>(
        `${this.baseUrl}/evacuation/from/${encodeURIComponent(startNode)}`
      )
      .pipe(map((res) => (Array.isArray(res?.path) ? res.path : [])));
  }

  //  BLOCK / UNBLOCK corridor
 
  blockCorridor(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/corridors/${id}/block`, {});
  }

  unblockCorridor(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/corridors/${id}/unblock`, {});
  }
}
