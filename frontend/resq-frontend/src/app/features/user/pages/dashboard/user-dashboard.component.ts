// ================= IMPORT =================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

import { NotificationSocketService } from '../../../../core/services/notification-socket.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';


// ================= COMPONENT =================

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})

export class UserDashboardComponent implements OnInit, OnDestroy {

  username: string | null = null;
  private notificationSub!: Subscription;

  constructor(
    private authService: AuthService,
    private socketService: NotificationSocketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {

    const stored = localStorage.getItem('username');
    this.username = stored;

    const building = localStorage.getItem('building');

    if (building) {

      this.socketService.connect(building);

      this.notificationSub = this.socketService.notification$
        .subscribe(notification => {

          if (notification) {

            this.snackBar.open(
              `🚨 Corridoio bloccato: ${notification.fromNode} → ${notification.toNode}`,
              'OK',
              { duration: 5000 }
            );

          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    this.socketService.disconnect();
  }

}