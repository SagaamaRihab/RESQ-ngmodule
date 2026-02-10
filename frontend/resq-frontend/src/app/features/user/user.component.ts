import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {}
