import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize, take } from 'rxjs/operators';

import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  isLoading = false;
  submitted = false;

  role: 'USER' | 'ADMIN' = 'USER';
  errorMessage = '';

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  adminKey = '';

  // TOAST
  showSuccess = false;
  showError = false;

  successMessage = '';
  errorMessageToast = '';

  private toastTimer: any;


  // MODAL
  showModal = false;
  modalType: 'success' | 'error' = 'success';
  modalMessage = '';



  // ✅ password: 6 caratteri, maiuscola, minuscola, numero, speciale
  passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}


  




  setRole(role: 'USER' | 'ADMIN'): void {
    this.role = role;
    this.resetModel();
  }

  
  onSignup(form: NgForm): void {

  this.submitted = true;
  this.errorMessage = '';

  // ❌ NON toccare showModal qui


  // Form invalid
  if (form.invalid) {
    this.openModal('error', 'Compila tutti i campi correttamente');
    return;
  }

  // Password regex
  if (!this.passwordRegex.test(this.password)) {
    this.openModal(
      'error',
      'Password non valida (maiuscola, minuscola, numero, simbolo)'
    );
    return;
  }

  // Password match
  if (this.password !== this.confirmPassword) {
    this.openModal('error', 'Le password non coincidono');
    return;
  }

  // Admin key
  if (this.role === 'ADMIN' && !this.adminKey) {
    this.openModal('error', 'Admin Key obbligatoria');
    return;
  }

  const payload: any = {
    username: this.username.trim(),
    email: this.email.trim(),
    password: this.password,
    role: this.role
  };

  if (this.role === 'ADMIN') {
    payload.adminKey = this.adminKey.trim();
  }

  this.isLoading = true;

  this.authService.signup(payload)
    .pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({

      // ✅ SUCCESS
      next: () => {

        this.openModal(
          'success',
          'Registration completed successfully!'
        );

      },

      // ❌ ERROR
      error: (err: any) => {

        console.error('SIGNUP ERROR:', err);

        let msg = 'Registration error';

        if (err?.error?.message) {
          msg = err.error.message;
        } else if (err?.message) {
          msg = err.message;
        }

        this.openModal('error', msg);

      }

    });

}




  private resetModel(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.adminKey = '';
    this.errorMessage = '';
    this.submitted = false;
  }

openModal(type: 'success' | 'error', message: string): void {

  this.modalType = type;
  this.modalMessage = message;
  this.showModal = true;

  this.cdr.detectChanges(); // 🔥 forza refresh

}






closeModal(): void {

  this.showModal = false;

  this.cdr.detectChanges();

  if (this.modalType === 'success') {
    this.resetModel();
    this.router.navigate(['/signin']);
  }

}








}
