import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';



@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class UserProfileComponent implements OnInit {

  // ===== BASE USER INFO =====
  username: string = '';
  email: string = '';
  role: string = '';

  // ===== ACADEMIC INFO =====
  phone: string = '';
  academicYear: string = '2025/2026';
  school: string = 'Scuola di Ingegneria';
  course: string = 'Ingegneria Informatica';

  successMessage: string = '';
  showSuccess: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  passwordSuccessMsg: string = '';
passwordErrorMsg: string = '';


  isSaving: boolean = false;

  // ===== SETTINGS MODALS =====
  passwordData: { oldPassword: string; newPassword: string } = {
  oldPassword: '',
  newPassword: ''
};

  showPasswordModal = false;
  showEmailModal = false;
  showDeleteModal = false;

 
  newEmail = '';
  




  // ===== ABOUT =====
  about: string =
    'User of RESQ emergency evacuation system. Interested in safety management and building monitoring.';

  // ===== MODAL STATE =====
  showEditModal: boolean = false;

  // ===== EDIT FIELDS =====
  editUsername: string = '';
  editEmail: string = '';
  editPhone: string = '';
  editCourse: string = '';
  editAbout: string = '';

  constructor(
  private router: Router,
  private userService: UserService
) {}


  userId!: number;
  ngOnInit(): void {

    this.showEditModal = false;

    // Carica SUBITO dal login
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    this.userId = Number(localStorage.getItem('userId') || 0);


    // Aggiorna dal backend (silenzioso)
    this.loadProfile();
  }







  // ===== MODAL OPEN =====
  openEditModal(): void {
    this.editUsername = this.username;
    this.editEmail = this.email;
    this.editPhone = this.phone;
    this.editCourse = this.course;
    this.editAbout = this.about;

    this.showEditModal = true;
  }

  // ===== MODAL CLOSE =====
  closeEditModal(): void {
    this.showEditModal = false;

    // reset campi (opzionale)
    this.editUsername = '';
    this.editEmail = '';
    this.editPhone = '';
    this.editCourse = '';
    this.editAbout = '';
  }


  // ===== SAVE PROFILE =====
 saveProfile(): void {

    if (this.isSaving) return; 

    this.isSaving = true;

    const id = Number(localStorage.getItem('userId'));
    if (!id) return;

    const data = {
      username: this.editUsername,
      email: this.editEmail,
      phone: this.editPhone,
      course: this.editCourse,
      about: this.editAbout
    };

    // chiudi SUBITO il modal
    this.closeEditModal();

    // mostra SUBITO il toast
    this.successMessage = 'Profilo aggiornato con successo';
    this.showSuccess = true;

    this.userService.updateUser(id, data).subscribe({

      next: (updatedUser: any) => {

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





 loadProfile() {

    const id = Number(localStorage.getItem('userId') || 0);

    if (!id) return; // per ora non blocchiamo


    this.userService.getUserById(id).subscribe({

      next: (user) => {

        console.log('USER:', user);

        // Salva in localStorage (serve a dashboard + sidebar)
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

        // Aggiorna UI
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

  // ================= SETTINGS =================

openPasswordModal() {
  this.showPasswordModal = true;

  // reset messaggi
  this.passwordSuccessMsg = '';
  this.passwordErrorMsg = '';

  // reset campi
  this.passwordData = { oldPassword: '', newPassword: '' };
}


openEmailModal() {
  this.showEmailModal = true;
}

openDeleteModal() {
  this.showDeleteModal = true;
}

closeModal() {
  this.showPasswordModal = false;
  this.showEmailModal = false;
  this.showDeleteModal = false;

  // reset messaggi
  this.passwordSuccessMsg = '';
  this.passwordErrorMsg = '';

  // reset campi
  this.passwordData = { oldPassword: '', newPassword: '' };
  this.newEmail = '';

  // pulizia vecchi toast generali
  this.successMessage = '';
  this.errorMessage = '';
}



changePassword() {
  this.passwordSuccessMsg = '';
  this.passwordErrorMsg = '';

  // VALIDAZIONE FRONTEND
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

      // se backend manda token nuovo, lo aggiorniamo
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
      } else if (err.status === 400) {
        this.passwordErrorMsg = err?.error?.message || 'Dati non validi.';
      } else {
        this.passwordErrorMsg = 'Errore durante il cambio password.';
      }
    }
  });
}







changeEmail() {

  if (!this.newEmail) return;

  console.log('Nuova email:', this.newEmail);

  this.email = this.newEmail;
  localStorage.setItem('email', this.newEmail);

  alert('Email aggiornata (demo)');

  this.closeModal();
}


deleteAccount() {

  if (!confirm('Vuoi davvero eliminare il tuo account?')) {
    return;
  }

  console.log('Account eliminato');

  localStorage.clear();

  alert('Account eliminato');

  this.router.navigate(['/signin']);
}








  // ===== LOGOUT =====
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }

  
}
