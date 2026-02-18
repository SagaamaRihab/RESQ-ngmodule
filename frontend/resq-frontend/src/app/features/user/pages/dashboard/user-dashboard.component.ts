// ================= IMPORT =================

// Component base Angular
import { Component, OnInit } from '@angular/core';

// Moduli comuni
import { CommonModule } from '@angular/common';

// Direttiva per usare routerLink nel template
import { RouterLink } from '@angular/router';

// Service per autenticazione (login/logout)
import { AuthService } from '../../../../core/services/auth.service';


// ================= COMPONENT =================

@Component({
  selector: 'app-user-dashboard',

  // Standalone component
  standalone: true,

  // Moduli utilizzati dal componente
  imports: [CommonModule, RouterLink],

  // Template HTML associato
  templateUrl: './user-dashboard.component.html',

  // File CSS associato
  styleUrls: ['./user-dashboard.component.css']
})

export class UserDashboardComponent implements OnInit {


  // =================================================
  // ============ DATI UTENTE ========================
  // =================================================

  // Username mostrato nella dashboard
  username: string | null = null;


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(
    private authService: AuthService
  ) {}


  // =================================================
  // ============ INIZIALIZZAZIONE ===================
  // =================================================

  ngOnInit(): void {

    // Recupera username salvato al login
    const stored = localStorage.getItem('username');

    console.log('STORED USERNAME =', stored);

    // Assegna valore alla variabile
    this.username = stored;
  }

}
