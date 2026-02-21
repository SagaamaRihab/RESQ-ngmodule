// ================= IMPORT =================

// Component base Angular
import { Component } from '@angular/core';

// Router per la navigazione tra pagine
import { Router } from '@angular/router';

// Moduli comuni Angular
import { CommonModule } from '@angular/common';

// Per gestire le rotte figlie (router-outlet)
import { RouterOutlet } from '@angular/router';


// ================= COMPONENT =================

@Component({
  selector: 'app-user-map',

  // Standalone component (Angular moderno)
  standalone: true,

  // Moduli usati dal componente
  imports: [CommonModule, RouterOutlet],

  // Template HTML associato
  templateUrl: './user-map.component.html',

  // File CSS associato
  styleUrls: ['./user-map.component.css']
})

export class UserMapComponent {


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(private router: Router) {}


  // =================================================
  // ============ APERTURA EDIFICIO ==================
  // =================================================

  /**
   * Naviga verso la mappa interna di un edificio
   * @param building Lettera dell'edificio (A, B, C, D...)
   */
  openBuilding(building: string) {

    // Naviga alla rotta: /user/map/A (esempio)
    this.router.navigate(['/user/map', building]);
  }


  // =================================================
  // ============ AVVIO EVACUAZIONE ==================
  // =================================================

  /**
   * Avvia il percorso di evacuazione partendo
   * da un nodo specifico
   * @param node Nodo iniziale della mappa
   */
  startEvacuationFrom(node: string) {

    // Salva il nodo iniziale nel localStorage
    localStorage.setItem('startNode', node);

    // Naviga alla pagina di evacuazione
    this.router.navigate(['/user/evacuation']);

  }

}
