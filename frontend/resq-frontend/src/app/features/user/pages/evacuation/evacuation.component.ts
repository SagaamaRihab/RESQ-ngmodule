// ================= IMPORT =================

// Component Angular
import { Component, OnInit } from '@angular/core';

// Moduli comuni
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Service per chiamare il backend
import { EvacuationService } from '../../../../core/services/evacuation.service';

// Modello risposta evacuazione
import { EvacuationResponse } from '../../../../core/models/evacuation-response.model';

// Componente per visualizzare il percorso
import { PathViewerComponent } from '../../../../shared/components/path-viewer/path-viewer.component';


// ================= COMPONENT =================

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule, PathViewerComponent],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],
})

export class EvacuationComponent implements OnInit {

  // =================================================
  // ============ STATO PRINCIPALE ===================
  // =================================================

  // Nodo di partenza inserito dall'utente
  startNode = '';

  // Percorso calcolato
  path: string[] = [];

  // Corridoi bloccati (eventuale estensione futura)
  blockedCorridors: string[] = [];

  // Stato caricamento
  loading = false;

  // Messaggio errore
  error: string | null = null;
  notification: string | null = null;


  // Risposta completa dal backend
  response: EvacuationResponse | null = null;


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(
    private evacuationService: EvacuationService
  ) {}


  // =================================================
  // ============ CALCOLO PERCORSO ===================
  // =================================================

  calculate(): void {

    console.log('CALCULATE BUTTON CLICKED');

    // Reset stato
    this.error = null;
    this.response = null;
    this.loading = true;

    // Validazione input
    if (!this.startNode.trim()) {
      this.error = 'Please enter a starting node';
      this.loading = false;
      return;
    }

    // Chiamata al backend
    this.evacuationService
      .calculateEvacuation(this.startNode.trim())
      .subscribe({

        // ================= SUCCESS =================
        next: (res: EvacuationResponse) => {

          this.response = res;
          this.path = res?.path ?? [];

          // ✅ NOTIFICA
          this.notification = res.message;

          // sparisce dopo 5 secondi
          setTimeout(() => {
            this.notification = null;
          }, 5000);

        },
        


        // ================= ERROR =================
        error: (err) => {

          console.error('ERROR:', err);

          this.error = 'Error calculating evacuation route';
          this.loading = false;
        },


        // ================= COMPLETE =================
        complete: () => {

          console.log('REQUEST COMPLETED');

          this.loading = false;
        }

      });
  }


  // =================================================
  // ============ INIZIALIZZAZIONE ===================
  // =================================================

  ngOnInit(): void {

    // Se esiste nodo salvato → ricalcola automaticamente
    const saved = localStorage.getItem('startNode');

    if (saved) {

      this.startNode = saved;

      this.calculate();
    }

  }

}
