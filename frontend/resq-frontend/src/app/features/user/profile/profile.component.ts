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
  isSaving: boolean = false;


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

    // ✅ Carica SUBITO dal login
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';

    this.userId = Number(localStorage.getItem('userId'));

    if (!this.userId) {
      this.router.navigate(['/signin']);
      return;
    }

    // ✅ Aggiorna dal backend (silenzioso)
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

    // ✅ chiudi SUBITO il modal
    this.closeEditModal();

    // ✅ mostra SUBITO il toast
    this.successMessage = 'Profilo aggiornato con successo';
    this.showSuccess = true;

    this.userService.updateUser(id, data).subscribe({

      next: (updatedUser) => {

        this.username = updatedUser.username;
        this.email = updatedUser.email;
        this.phone = updatedUser.phone;
        this.course = updatedUser.course;
        this.about = updatedUser.about;

        // ⏱️ toast sparisce
        setTimeout(() => {
          this.showSuccess = false;
        }, 2000);

        this.isSaving = false;
      },

      error: () => {
        this.isSaving = false;
      }

    });
  }





 loadProfile() {

    const id = Number(localStorage.getItem('userId'));

    if (!id) return;

    this.userService.getUserById(id).subscribe({

      next: (user) => {

        console.log('USER:', user);

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





  // ===== LOGOUT =====
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }

  
}
