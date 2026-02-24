import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminName: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('username');
    this.adminName = storedName ? storedName : null;
  }

  goTo(section: string): void {
    this.router.navigate(['/admin', section]);
  }
}
