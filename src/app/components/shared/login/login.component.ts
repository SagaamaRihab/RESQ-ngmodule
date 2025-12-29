import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false   
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    console.log('Login attempt:', this.email, this.password);

    // per ora simuliamo login corretto
    this.errorMessage = '';
    alert('Login successful (simulation)');
  }
}