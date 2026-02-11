import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize, take } from 'rxjs/operators';

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

  // ✅ password: 6 caratteri, maiuscola, minuscola, numero, speciale
  passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setRole(role: 'USER' | 'ADMIN'): void {
    this.role = role;
    this.resetModel();
  }

  onSignup(form: NgForm): void {
    this.submitted = true;
    this.errorMessage = '';

    if (form.invalid) return;

    if (!this.passwordRegex.test(this.password)) {
      this.errorMessage =
        'Password non valida';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Le password non coincidono';
      return;
    }

    if (this.role === 'ADMIN' && !this.adminKey) {
      this.errorMessage = 'Admin Key obbligatoria';
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

    this.isLoading = true;

    this.authService.signup(payload)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {
          this.resetModel();
          this.router.navigateByUrl('/signin?registered=true');
        },
        error: (err: any) => {
          this.errorMessage =
            err?.error?.message || 'Errore durante la registrazione';
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
}
