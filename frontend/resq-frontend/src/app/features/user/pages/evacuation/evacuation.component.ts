import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EvacuationService } from '../../../../core/services/evacuation.service';
import { EvacuationResponse } from '../../../../core/models/evacuation-response.model';
import { PathViewerComponent } from '../../../../shared/components/path-viewer/path-viewer.component';

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule, PathViewerComponent],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],
})
export class EvacuationComponent implements OnInit {

  startNode = '';
  path: string[] = [];
  blockedCorridors: string[] = [];

  loading = false;
  error: string | null = null;
  response: EvacuationResponse | null = null;

  constructor(
    private evacuationService: EvacuationService
  ) {}

  calculate(): void {

    console.log('CLICK CALCOLA');

    this.error = null;
    this.response = null;
    this.loading = true;

    if (!this.startNode.trim()) {
      this.error = 'Inserisci un nodo di partenza';
      this.loading = false;
      return;
    }

    this.evacuationService
      .calculateEvacuation(this.startNode.trim())
      .subscribe({

        next: (res: EvacuationResponse) => {
          console.log('RISPOSTA SERVER:', res);

          this.response = res;
          this.path = res?.path ?? [];
          this.blockedCorridors = [];

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


  ngOnInit(): void {

    const saved = localStorage.getItem('startNode');

    if (saved) {
      this.startNode = saved;
      this.calculate();
    }

  }

}
