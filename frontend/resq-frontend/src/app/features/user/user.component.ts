import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
=======
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17

@Component({
  selector: 'app-user',
  standalone: true,
<<<<<<< HEAD
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
=======
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17
})
export class UserComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
