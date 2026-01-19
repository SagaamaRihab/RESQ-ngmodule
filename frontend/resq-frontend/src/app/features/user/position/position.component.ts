import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent {
  isLoading = false;
  errorMessage = '';

  coords: { lat: number; lng: number } | null = null;

  shareLocation(): void {
    this.errorMessage = '';
    this.coords = null;

    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocalizzazione non supportata dal browser.';
      return;
    }

    this.isLoading = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.isLoading = false;
        this.coords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        };
      },
      (err) => {
        this.isLoading = false;

        if (err.code === err.PERMISSION_DENIED) {
          this.errorMessage = 'Permesso negato. Abilita la posizione nel browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          this.errorMessage = 'Posizione non disponibile.';
        } else if (err.code === err.TIMEOUT) {
          this.errorMessage = 'Timeout: riprova.';
        } else {
          this.errorMessage = 'Errore durante la geolocalizzazione.';
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  saveLocation(): void {
    if (!this.coords) return;

    localStorage.setItem('user_position', JSON.stringify({
      ...this.coords,
      savedAt: new Date().toISOString()
    }));
  }
}
