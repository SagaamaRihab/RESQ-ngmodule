import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  isLoading: boolean = false;

  formVisible = true;
  role: 'USER' | 'ADMIN' = 'USER';
  errorMessage = '';

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  adminKey = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setRole(role: 'USER' | 'ADMIN'): void {
    this.role = role;
    this.resetModel();
  }

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

    this.isLoading = true;

    this.authService.signup(payload).pipe(
      take(1),
      finalize(() => (this.isLoading = false))
    ).subscribe({
      next: () => {
        this.resetModel();
        this.role = 'USER';
        this.router.navigateByUrl('/signin?registered=true');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.error || 'Signup failed';
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
  }
}
