import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { EvacuationService } from '../../../../core/services/evacuation.service';
import { EvacuationResponse } from '../../../../core/models/evacuation-response.model';
import { PathViewerComponent } from '../../../../shared/components/path-viewer/path-viewer.component';

interface NodeApiDto {
  label: string;
  displayName: string;
}

@Component({
  selector: 'app-admin-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule, PathViewerComponent],
  templateUrl: './admin-evacuation.component.html',
  styleUrls: ['./admin-evacuation.component.css'],
})
export class AdminEvacuationComponent implements OnInit {

  // Lista nodi caricati dal backend
  nodes: NodeApiDto[] = [];

  // Questo ora conterrà SEMPRE la LABEL (es: A_T_BIBLIOTECA)
  startNode = '';

  path: string[] = [];
  blockedCorridors: string[] = [];

  loading = false;
  error: string | null = null;
  response: EvacuationResponse | null = null;

  constructor(
    private evacuationService: EvacuationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    // Carico tutti i nodi dal backend
    this.http.get<NodeApiDto[]>('/api/map/nodes').subscribe({
      next: (data) => {
        this.nodes = data ?? [];

        // Se avevo già salvato una label in localStorage
        const saved = localStorage.getItem('startNode');
        if (saved) {
          this.startNode = saved; // deve essere una LABEL
          this.calculate();
        }
      },
      error: (err) => {
        console.error('Errore caricamento nodi', err);
        this.nodes = [];
      }
    });
  }

  calculate(): void {

    console.log('CLICK CALCOLA');
    console.log('LABEL INVIATA AL BACKEND:', this.startNode);

    this.error = null;
    this.response = null;
    this.loading = true;

    if (!this.startNode.trim()) {
      this.error = 'Seleziona un nodo di partenza';
      this.loading = false;
      return;
    }

    this.evacuationService
      .calculateEvacuation(this.startNode.trim()) // <-- ORA PASSA LABEL
      .subscribe({

        next: (res: EvacuationResponse) => {
          console.log('RISPOSTA SERVER:', res);

          this.response = res;
          this.path = res?.path ?? [];
          this.blockedCorridors = [];

          // Salvo la LABEL
          localStorage.setItem('startNode', this.startNode);
        },

        error: (err) => {
          console.error('ERRORE:', err);

          this.error = 'Errore nel calcolo del percorso';
          this.loading = false;
        },

        complete: () => {
          console.log('COMPLETATO');
          this.loading = false;
        }
      });
  }
}