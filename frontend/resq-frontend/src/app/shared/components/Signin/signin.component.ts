import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {

  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

onLogin() {
  this.authService.signin({
    email: this.email,
    password: this.password
  }).subscribe({
    next: (res) => {
      this.router.navigate([res.role === 'ADMIN' ? '/admin' : '/user']);
    },
    error: () => {
      this.errorMessage = 'Credenziali non valide';
    }
  });
}





  
}
