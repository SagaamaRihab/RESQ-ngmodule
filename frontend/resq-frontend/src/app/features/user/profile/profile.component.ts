// ================= IMPORT =================

// Component base di Angular
import { Component, OnInit } from '@angular/core';

// Moduli comuni Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Router per navigazione
import { Router } from '@angular/router';

// Service per comunicare con il backend
import { UserService } from '../../../core/services/user.service';


// ================= COMPONENT =================

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class UserProfileComponent implements OnInit {

  // =================================================
  // =============== DATI UTENTE BASE ================
  // =================================================

  username: string = '';
  email: string = '';
  role: string = '';


  // =================================================
  // ============ DATI ACCADEMICI ====================
  // =================================================

  phone: string = '';
  academicYear: string = '2025/2026';
  school: string = 'Scuola di Ingegneria';
  course: string = 'Ingegneria Informatica';


  // =================================================
  // ============ MESSAGGI TOAST ======================
  // =================================================

  successMessage: string = '';
  showSuccess: boolean = false;

  errorMessage: string = '';
  showError: boolean = false;

  passwordSuccessMsg: string = '';
  passwordErrorMsg: string = '';


  // =================================================
  // ============ STATO SALVATAGGIO ===================
  // =================================================

  // Evita salvataggi multipli
  isSaving: boolean = false;


  // =================================================
  // ============ DATI PASSWORD ======================
  // =================================================

  passwordData: {
    oldPassword: string;
    newPassword: string;
  } = {
    oldPassword: '',
    newPassword: ''
  };


  // =================================================
  // ============ MODAL SETTINGS =====================
  // =================================================

  showPasswordModal = false;
  showEmailModal = false;
  showDeleteModal = false;

  newEmail = '';


  // =================================================
  // ============ SEZIONE ABOUT ======================
  // =================================================

  about: string =
    'User of RESQ emergency evacuation system. Interested in safety management and building monitoring.';


  // =================================================
  // ============ MODAL MODIFICA =====================
  // =================================================

  showEditModal: boolean = false;


  // =================================================
  // ============ CAMPI MODIFICA =====================
  // =================================================

  editUsername: string = '';
  editEmail: string = '';
  editPhone: string = '';
  editCourse: string = '';
  editAbout: string = '';


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(
    private router: Router,
    private userService: UserService
  ) {}


  // ID utente
  userId!: number;


  // =================================================
  // ============ INIZIALIZZAZIONE ===================
  // =================================================

  ngOnInit(): void {

    // Chiude eventuale modal aperto
    this.showEditModal = false;


    // Carica dati salvati dal login
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';

    const token = localStorage.getItem('token');


    // Se non esiste token → redirect al login
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }


    // Recupera ID utente
    this.userId = Number(localStorage.getItem('userId') || 0);


    // Carica profilo aggiornato dal backend
    this.loadProfile();
  }


  // =================================================
  // ============ APERTURA MODAL =====================
  // =================================================

  openEditModal(): void {

    // Copia dati attuali nei campi editabili
    this.editUsername = this.username;
    this.editEmail = this.email;
    this.editPhone = this.phone;
    this.editCourse = this.course;
    this.editAbout = this.about;

    this.showEditModal = true;
  }


  // =================================================
  // ============ CHIUSURA MODAL =====================
  // =================================================

  closeEditModal(): void {

    this.showEditModal = false;

    // Reset campi
    this.editUsername = '';
    this.editEmail = '';
    this.editPhone = '';
    this.editCourse = '';
    this.editAbout = '';
  }


  // =================================================
  // ============ SALVATAGGIO PROFILO ================
  // =================================================

  saveProfile(): void {

    // Evita click multipli
    if (this.isSaving) return;

    this.isSaving = true;


    const id = Number(localStorage.getItem('userId'));
    if (!id) return;


    // Dati da inviare al backend
    const data = {
      username: this.editUsername,
      email: this.editEmail,
      phone: this.editPhone,
      course: this.editCourse,
      about: this.editAbout
    };


    // Chiude subito modal
    this.closeEditModal();


    // Mostra messaggio ottimistico
    this.successMessage = 'Profilo aggiornato con successo';
    this.showSuccess = true;


    // Chiamata API
    this.userService.updateUser(id, data).subscribe({

      next: (updatedUser: any) => {

        // Aggiorna UI
        this.username = updatedUser.username;
        this.email = updatedUser.email;
        this.phone = updatedUser.phone || '';
        this.course = updatedUser.course || '';
        this.about = updatedUser.about || '';
      },

      error: () => {
        this.isSaving = false;
      }

    });
  }


  // =================================================
  // ============ CARICA PROFILO =====================
  // =================================================

  loadProfile() {

    this.userService.getMyProfile().subscribe({

      next: (user: any) => {

        console.log('USER:', user);


        // Salva dati in localStorage
        if (user.id) {
          localStorage.setItem('userId', user.id.toString());
        }

        if (user.username) {
          localStorage.setItem('username', user.username);
        }

        if (user.email) {
          localStorage.setItem('email', user.email);
        }

        if (user.role) {
          localStorage.setItem('role', user.role);
        }


        // Aggiorna interfaccia
        this.username = user.username;
        this.email = user.email;
        this.role = user.role;

        this.phone = user.phone || '';
        this.course = user.course || '';
        this.about = user.about || '';
      },


      error: (err) => {
        console.error('Load profile error', err);
      }

    });
  }


  // =================================================
  // ============ SETTINGS ===========================
  // =================================================

  openPasswordModal() {

    this.showPasswordModal = true;

    // Reset messaggi
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    // Reset campi
    this.passwordData = { oldPassword: '', newPassword: '' };
  }


  openEmailModal() {
    this.showEmailModal = true;
  }


  openDeleteModal() {
    this.showDeleteModal = true;
  }


  closeModal() {

    // Chiude tutti i modal
    this.showPasswordModal = false;
    this.showEmailModal = false;
    this.showDeleteModal = false;

    // Reset messaggi
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    // Reset campi
    this.passwordData = { oldPassword: '', newPassword: '' };
    this.newEmail = '';

    // Reset toast
    this.successMessage = '';
    this.errorMessage = '';
  }


  // =================================================
  // ============ CAMBIO PASSWORD ===================
  // =================================================

  changePassword() {

    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';


    // Validazione frontend
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.passwordErrorMsg = 'Compila tutti i campi.';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.passwordErrorMsg = 'La nuova password deve avere almeno 6 caratteri.';
      return;
    }


    this.userService.changeMyPassword(this.passwordData).subscribe({

      next: (response: any) => {

        // Aggiorna token
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }

        this.passwordSuccessMsg = 'Password aggiornata con successo!';

        setTimeout(() => {
          this.closeModal();
        }, 1200);
      },


      error: (err: any) => {

        if (err.status === 401) {
          this.passwordErrorMsg = 'Password attuale non corretta.';
        }
        else if (err.status === 400) {
          this.passwordErrorMsg = err?.error?.message || 'Dati non validi.';
        }
        else {
          this.passwordErrorMsg = 'Errore durante il cambio password.';
        }
      }

    });
  }


  // =================================================
  // ============ CAMBIO EMAIL ======================
  // =================================================

  changeEmail() {

    if (!this.newEmail) {
      this.passwordErrorMsg = 'Inserisci una email valida';
      return;
    }


    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';


    this.userService.changeMyEmail(this.newEmail).subscribe({

      next: (res: any) => {

        console.log('RISPOSTA BACKEND:', res);


        // Salva token nuovo
        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }


        // Aggiorna email
        localStorage.setItem('email', this.newEmail);
        this.email = this.newEmail;


        this.passwordSuccessMsg = 'Email aggiornata con successo!';


        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },


      error: (err) => {

        console.error('ERRORE CAMBIO EMAIL:', err);

        if (err.status === 401) {
          this.passwordErrorMsg = 'Sessione scaduta. Rifai login.';
        }
        else {
          this.passwordErrorMsg = 'Errore nel cambio email';
        }
      }

    });
  }


  // =================================================
  // ============ ELIMINAZIONE ACCOUNT ===============
  // =================================================

  deleteAccount() {

    if (!confirm('Vuoi davvero eliminare il tuo account?')) {
      return;
    }


    this.userService.deleteMyAccount().subscribe({

      next: () => {

        alert('Account eliminato con successo');

        localStorage.clear();

        this.router.navigate(['/signin']);
      },


      error: (err) => {

        console.error('Errore eliminazione account', err);

        if (err.status === 401) {
          alert('Sessione scaduta. Rifai login.');
        }
        else {
          alert('Errore durante eliminazione account');
        }
      }

    });
  }


  // =================================================
  // ============ LOGOUT =============================
  // =================================================

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/signin']);
  }

}
