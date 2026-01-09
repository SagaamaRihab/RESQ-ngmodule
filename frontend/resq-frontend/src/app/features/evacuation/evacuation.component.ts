import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EvacuationService } from '../../core/services/evacuation.service';
import { EvacuationResponse } from '../../core/models/evacuation-response.model';
import { PathViewerComponent } from '../../shared/components/path-viewer/path-viewer.component';



@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule, PathViewerComponent],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css']
})
export class EvacuationComponent {

  startNode = '';
  response: EvacuationResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private evacuationService: EvacuationService) {}

  calculate(): void {
  this.error = null;
  this.response = null;

  if (!this.startNode.trim()) {
    this.error = 'Inserisci un nodo di partenza';
    return;
  }

  this.loading = true;

  this.evacuationService
    .calculateEvacuation(this.startNode.trim())
    .subscribe({
      next: (res) => {
        console.log('RISPOSTA BACKEND:', res); // 🔍 DEBUG
        this.response = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('ERRORE:', err); // 🔍 DEBUG
        this.error = 'Errore nel calcolo del percorso';
        this.loading = false;
      }
    });
}

}
