import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  email: string = '';
  password: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // Messaggio dopo registrazione
    if (this.route.snapshot.queryParamMap.get('registered')) {

      this.successMessage =
        'Registrazione completata con successo. Effettua il login.';

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });

    }
  }


  // ================= LOGIN =================
  onLogin(): void {

    this.errorMessage = '';
    this.successMessage = '';

    this.authService.signin({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (res) => {

        console.log('LOGIN RESPONSE:', res);

        // Salva token e dati
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        localStorage.setItem('userId', res.id.toString());


        // Redirect
        this.router.navigate(['/user']);

      },


      error: (err) => {

        console.error('Login error:', err);

        this.errorMessage = 'Email o password non corretti';

      }

    });

  }

}
