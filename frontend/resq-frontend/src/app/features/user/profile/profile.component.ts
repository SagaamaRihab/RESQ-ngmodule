// ================= IMPORT =================

// Angular base component
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// Angular common modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Router for navigation
import { Router } from '@angular/router';

// Service to communicate with backend
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
  // =============== BASIC USER DATA =================
  // =================================================

  username: string = '';
  email: string = '';
  role: string = '';


  // =================================================
  // ============ ACADEMIC DATA ======================
  // =================================================

  phone: string = '';
  academicYear: string = '2025/2026';
  school: string = 'Engineering School';
  course: string = 'Computer Engineering';


  // =================================================
  // ============ TOAST MESSAGES =====================
  // =================================================

  successMessage: string = '';
  showSuccess: boolean = false;

  errorMessage: string = '';
  showError: boolean = false;

  
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';



  // =================================================
  // ============ SAVE STATE =========================
  // =================================================

  // Prevent multiple saves
  isSaving: boolean = false;
  private toastTimer: any = null;



  // =================================================
  // ============ PASSWORD DATA =====================
  // =================================================

  passwordData: {
    oldPassword: string;
    newPassword: string;
  } = {
    oldPassword: '',
    newPassword: ''
  };


  // =================================================
  // ============ SETTINGS MODALS ====================
  // =================================================

  showPasswordModal = false;
  showEmailModal = false;
  showDeleteModal = false;

  newEmail = '';


  // =================================================
  // ============ ABOUT SECTION ======================
  // =================================================

  about: string =
    'User of RESQ emergency evacuation system. Interested in safety management and building monitoring.';


  // =================================================
  // ============ EDIT MODAL =========================
  // =================================================

  showEditModal: boolean = false;


  // =================================================
  // ============ EDIT FIELDS ========================
  // =================================================

  editUsername: string = '';
  editEmail: string = '';
  editPhone: string = '';
  editCourse: string = '';
  editAbout: string = '';


  // =================================================
  // ============ CONSTRUCTOR ========================
  // =================================================

  constructor(
  private router: Router,
  private userService: UserService,
  
  private cd: ChangeDetectorRef
) {}


  // User ID
  userId!: number;



private showToast(type: 'success' | 'error', message: string) {

  if (this.toastTimer) {
    clearTimeout(this.toastTimer);
  }

  // Reset
  this.showSuccess = false;
  this.showError = false;

  // Mostra
  if (type === 'success') {
    this.successMessage = message;
    this.showSuccess = true;
  } else {
    this.errorMessage = message;
    this.showError = true;
  }

  // Forza Angular
  this.cd.detectChanges();

  // Auto hide dopo 3s
  this.toastTimer = setTimeout(() => {
    this.showSuccess = false;
    this.showError = false;
    this.cd.detectChanges();
  }, 2000);
}








  // =================================================
  // ============ INITIALIZATION =====================
  // =================================================

  ngOnInit(): void {

    // Close any open modal
    this.showEditModal = false;


    // Load saved login data
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';

    const token = localStorage.getItem('token');


    // If token is missing → redirect to login
    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }


    // Get user ID
    this.userId = Number(localStorage.getItem('userId') || 0);


    // Load updated profile from backend
    this.loadProfile();
  }


  // =================================================
  // ============ OPEN EDIT MODAL ====================
  // =================================================

  openEditModal(): void {



    this.showSuccess = false;
    this.showError = false;
    this.successMessage = '';
    this.errorMessage = '';

    // Copy current data into edit fields
    this.editUsername = this.username;
    this.editEmail = this.email;
    this.editPhone = this.phone;
    this.editCourse = this.course;
    this.editAbout = this.about;

    this.showEditModal = true;

   


  }


  // =================================================
  // ============ CLOSE EDIT MODAL ===================
  // =================================================

  closeEditModal(): void {

    this.showEditModal = false;

    this.modalMessage = '';
    this.modalType = '';

    // Reset fields
    this.editUsername = '';
    this.editEmail = '';
    this.editPhone = '';
    this.editCourse = '';
    this.editAbout = '';
  }


  // =================================================
  // ============ SAVE PROFILE =======================
  // =================================================

 saveProfile(): void {

  if (this.isSaving) return;
  this.isSaving = true;

  const oldUsername = this.username;
  const oldPhone = this.phone;
  const oldCourse = this.course;
  const oldAbout = this.about;

  const data = {
    username: this.editUsername,
    phone: this.editPhone,
    course: this.editCourse,
    about: this.editAbout
  };

  this.userService.updateMyProfile(data).subscribe({

    next: (updatedUser: any) => {

      // Costruzione messaggio
      let changes: string[] = [];

      if (oldUsername !== updatedUser.username)
        changes.push('Username updated');

      if ((oldPhone || '') !== (updatedUser.phone || ''))
        changes.push('Phone updated');

      if ((oldCourse || '') !== (updatedUser.course || ''))
        changes.push('Course updated');

      if ((oldAbout || '') !== (updatedUser.about || ''))
        changes.push('About updated');

      const message = changes.length
        ? changes.join(' • ')
        : 'Profile updated';

      // Aggiorna UI
      this.username = updatedUser.username;
      this.phone = updatedUser.phone || '';
      this.course = updatedUser.course || '';
      this.about = updatedUser.about || '';

      localStorage.setItem('username', updatedUser.username);


      /* ✅ CHIUDI MODAL */
      this.showEditModal = false;

      /* ✅ MOSTRA TOAST */
      this.showToast('success', message);

      /* 🔥 FORZA AGGIORNAMENTO VIEW */
      this.cd.detectChanges();

      this.isSaving = false;
    },

    error: () => {

      this.showEditModal = false;

      this.showToast('error', 'Update failed');

      this.cd.detectChanges();

      this.isSaving = false;
    }

  });
}






  // =================================================
  // ============ LOAD PROFILE =======================
  // =================================================

  loadProfile() {



    this.userService.getMyProfile().subscribe({

      next: (user: any) => {

        console.log('USER:', user);


        // Save data in localStorage
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


        // Update UI
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


    // Reset fields
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

  

  this.passwordData = { oldPassword: '', newPassword: '' };
  this.newEmail = '';
}



  // =================================================
  // ============ CHANGE PASSWORD ===================
  // =================================================

 changePassword() {

  if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
    this.showToast('error', 'Please fill in all fields');
    return;
  }

  if (this.passwordData.newPassword.length < 6) {
    this.showToast('error', 'New password must be at least 6 characters');
    return;
  }

  this.userService.changeMyPassword(this.passwordData).subscribe({

    next: (response: any) => {

      if (response?.token) {
        localStorage.setItem('token', response.token);
      }

      this.showPasswordModal = false;

      this.passwordData = { oldPassword: '', newPassword: '' };

      this.showToast('success', 'Password updated successfully');
    },

    error: (err: any) => {

      if (err.status === 401) {
        this.showToast('error', 'Current password is incorrect');
      } else {
        this.showToast('error', 'Error while changing password');
      }
    }

  });
}



  // =================================================
  // ============ CHANGE EMAIL ======================
  // =================================================

 changeEmail() {

  if (!this.newEmail) {
    this.showToast('error', 'Please enter a valid email');
    return;
  }

  this.userService.changeMyEmail(this.newEmail).subscribe({

    next: (res: any) => {

      if (res?.token) {
        localStorage.setItem('token', res.token);
      }

      // Update UI
      this.email = this.newEmail;
      localStorage.setItem('email', this.newEmail);

      // Chiudi modal
      this.showEmailModal = false;

      // Reset input
      this.newEmail = '';

      // Toast
      this.showToast('success', 'Email updated successfully');
    },

    error: () => {
      this.showToast('error', 'Error while changing email');
    }

  });
}





  // =================================================
  // ============ DELETE ACCOUNT =====================
  // =================================================

  deleteAccount() {

    this.userService.deleteMyAccount().subscribe({

      next: () => {

        this.showDeleteModal = false;

        this.showToast('success', 'Account deleted successfully');

        setTimeout(() => {
          localStorage.clear();
          this.router.navigate(['/signin']);
        }, 2000);
      },

      error: () => {
        this.showToast('error', 'Error while deleting account');
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
