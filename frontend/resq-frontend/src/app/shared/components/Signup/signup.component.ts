import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  // =========================
  // STATO UI
  // =========================
  formVisible = true;
  role: 'USER' | 'ADMIN' = 'USER';
  errorMessage = '';

  // =========================
  // MODEL FORM
  // =========================
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  adminKey = '';

  constructor(private authService: AuthService) {}

  // =========================
  // CAMBIO RUOLO
  // =========================
  setRole(role: 'USER' | 'ADMIN'): void {
    this.role = role;
    this.resetModel();
  }

  // =========================
  // SUBMIT SIGNUP
  // =========================
  onSignup(form: NgForm): void {
  this.errorMessage = '';

  if (form.invalid) {
    this.errorMessage = 'Please fill in all required fields';
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match';
    return;
  }

  if (this.role === 'ADMIN' && !this.adminKey) {
    this.errorMessage = 'Admin Key is required';
    return;
  }

  const payload: any = {
    username: this.username,
    email: this.email,
    password: this.password,
    role: this.role
  };

  if (this.role === 'ADMIN') {
    payload.adminKey = this.adminKey;
  }

  this.authService.signup(payload).subscribe({
    next: () => {
      alert('Registrazione completata con successo. Effettua il login.');

      this.resetModel();
      this.role = 'USER';

      // redirect a signin
      window.location.href = '/signin';
    },
    error: (error) => {
      this.errorMessage = error?.error || 'Signup failed';
    }
  });
}


  // =========================
  // RESET MODEL
  // =========================
  private resetModel(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.adminKey = '';
    this.errorMessage = '';
  }
}
