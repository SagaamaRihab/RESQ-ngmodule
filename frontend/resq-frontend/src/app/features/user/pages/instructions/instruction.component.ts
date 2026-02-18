// ================= IMPORT =================

// Component base Angular
import { Component } from '@angular/core';

// Moduli comuni
import { CommonModule } from '@angular/common';

// Router per usare routerLink nel template
import { RouterModule } from '@angular/router';


// ================= COMPONENT =================

@Component({
  selector: 'app-instructions',

  // Standalone component
  standalone: true,

  // Moduli utilizzati dal componente
  imports: [
    CommonModule,
    RouterModule
  ],

  // Template HTML associato
  templateUrl: './instructions.component.html',

  // File CSS associato
  styleUrls: ['./instructions.component.css']
})

export class InstructionsComponent {


  // =================================================
  // ============ LISTA ISTRUZIONI ===================
  // =================================================

  /**
   * Elenco delle istruzioni di emergenza
   * Mostrate nella pagina Instructions
   */
  instructions = [

    {
      title: 'Stay Calm',
      description:
        'Avoid panic and follow the instructions provided by the RESQ system.'
    },

    {
      title: 'Follow Evacuation Routes',
      description:
        'Use only marked exits and do not use elevators.'
    },

    {
      title: 'Help People in Need',
      description:
        'If possible, assist people with reduced mobility.'
    },

    {
      title: 'Reach the Meeting Point',
      description:
        'Move away from the building and wait for instructions from authorities.'
    }

  ];

}
