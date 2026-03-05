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

import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';


// ================= COMPONENT =================

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],
})

export class EvacuationComponent implements OnInit {

  // =================================================
  // ============ STATO PRINCIPALE ===================
  // =================================================

  // Nodo di partenza inserito dall'utente
  startNode = '';
  
  floors: { value: string, label: string }[] = [];

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
  selectedBuilding = 'A';
  selectedFloor = 'ground';

  nodes = [
  { id: 'Entrance', label: 'Entrance' },
  { id: 'Hall', label: 'Hall' },
  { id: 'Library', label: 'Library' },
  { id: 'Stairs', label: 'Stairs' },
  { id: 'Study%20Room', label: 'Study Room' }
];


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(
    private evacuationService: EvacuationService,private userService: UserService, private router: Router
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

          // notifica
          this.notification = res.message;

          setTimeout(() => {
            this.notification = null;
          }, 5000);

          // salva dati per la map
          localStorage.setItem('startNode', this.startNode);
          localStorage.setItem('building', this.selectedBuilding);
          localStorage.setItem('floor', this.selectedFloor);

          // redirect alla Building Map
          this.router.navigate(['/user/map', this.selectedBuilding]);

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

  const userId = Number(localStorage.getItem('userId'));

  // salva visita evacuation
  this.userService.saveActivity(userId, 'view_evacuation')
    .subscribe({
      next: () => console.log('Evacuation visit saved'),
      error: (err) => console.error('Activity error', err)
    });

  // inizializza lista nodi in base a building + floor
  this.updateFloors();
  this.updateNodes();

  // Se esiste nodo salvato → ricalcola automaticamente
  const saved = localStorage.getItem('startNode');

  if (saved) {
    this.startNode = saved;
  }

}

 updateNodes() {

  // reset sempre i nodi
  this.nodes = [];
  this.startNode = '';

  // =========================
  // BUILDING A
  // =========================

  if (this.selectedBuilding === 'A') {

    if (this.selectedFloor === 'ground') {
      this.nodes = [
        { id: 'A_T_BIBLIOTECA', label: 'Library' },
        { id: 'A_T_SALA_STUDIO', label: 'Study Room' },
        { id: 'A_T_HALL', label: 'Hall' },
        { id: 'A_T_STAIRS', label: 'Stairs' },
        { id: 'A_T_ENTRANCE', label: 'Entrance' }
      ];
    }

    else if (this.selectedFloor === 'first') {
      this.nodes = [
        { id: 'A_1_AULA_3', label: 'Classroom 3' },
        { id: 'A_1_AULA_4', label: 'Classroom 4' },
        { id: 'A_1_HALL', label: 'Hall' },
        { id: 'A_1_STAIRS', label: 'Stairs' }
      ];
    }

    else if (this.selectedFloor === 'second') {
      this.nodes = [
        { id: 'A_2_AULA_7', label: 'Classroom 7' },
        { id: 'A_2_AULA_8', label: 'Classroom 8' },
        { id: 'A_2_AULA_9', label: 'Classroom 9' },
        { id: 'A_2_HALL', label: 'Hall' },
        { id: 'A_2_STAIRS', label: 'Stairs' }
      ];
    }

  }

  // =========================
  // BUILDING B
  // =========================

  else if (this.selectedBuilding === 'B') {

    if (this.selectedFloor === 'basement') {
      this.nodes = [
        { id: 'B_I_AULA_12', label: 'Classroom 12' },
        { id: 'B_I_AULA_13', label: 'Classroom 13' },
        { id: 'B_I_AULA_14', label: 'Classroom 14' },
        { id: 'B_I_ENTRANCE', label: 'Entrance' }
      ];
    }

    else if (this.selectedFloor === 'raised') {
      this.nodes = [
        { id: 'B_R_AULA_17', label: 'Classroom 17' },
        { id: 'B_R_AULA_18', label: 'Classroom 18' },
        { id: 'B_R_AULA_19', label: 'Classroom 19' },
        { id: 'B_R_AULA_20', label: 'Classroom 20' },
        { id: 'B_R_AULA_21', label: 'Classroom 21' },
        { id: 'B_R_ENTRANCE', label: 'Entrance' }
      ];
    }

    else if (this.selectedFloor === 'first') {
      this.nodes = [
        { id: 'B_P_AULA_22', label: 'Classroom 22' },
        { id: 'B_P_AULA_23', label: 'Classroom 23' },
        { id: 'B_P_AULA_24', label: 'Classroom 24' },
        { id: 'B_P_AULA_25', label: 'Classroom 25' },
        { id: 'B_P_ENTRANCE', label: 'Entrance' }
      ];
    }

  }

  // =========================
  // BUILDING D
  // =========================

  else if (this.selectedBuilding === 'D' && this.selectedFloor === 'ground') {

    this.nodes = [
      { id: 'D_T_INGRESSO_PRINCIPALE', label: 'Main Entrance' },
      { id: 'D_T_AULA_MAGNA', label: 'Main Hall' },
      { id: 'D_T_PORTINERIA', label: 'Reception' },
      { id: 'D_T_AULA_MINORE', label: 'Small Hall' },
      { id: 'D_T_STAIRS', label: 'Stairs' }
    ];

  }

}

 updateFloors() {

  if (this.selectedBuilding === 'A') {

    this.floors = [
      { value: 'ground', label: 'Ground Floor' },
      { value: 'first', label: 'First Floor' },
      { value: 'second', label: 'Second Floor' }
    ];

  }

  else if (this.selectedBuilding === 'B') {

    this.floors = [
      { value: 'basement', label: 'Basement' },
      { value: 'raised', label: 'Raised Floor' },
      { value: 'first', label: 'First Floor' }
    ];

  }

  else if (this.selectedBuilding === 'D') {

    this.floors = [
      { value: 'ground', label: 'Ground Floor' }
    ];

  }

  // reset
  this.selectedFloor = '';
  this.nodes = [];

}


}
