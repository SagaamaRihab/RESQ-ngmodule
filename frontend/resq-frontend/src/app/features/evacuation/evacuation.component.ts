import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


import { EvacuationService, EvacuationResponse} from '../admin/evacuations/evacuation.service';

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],
})
export class EvacuationComponent {
  loading = false;
  errorMsg = '';
  message = '';

  startNode = '';
  path: string[] = [];
  blockedCorridors: string[] = [];

  constructor(
    private evacuationService: EvacuationService,
    private router: Router
  ) {}

  compute(): void {
    const start = (this.startNode ?? '').trim();
    if (!start) return;

    this.loading = true;
    this.errorMsg = '';
    this.message = '';
    this.path = [];
    this.blockedCorridors = [];

    this.evacuationService.compute(start).subscribe({
      next: (res: EvacuationResponse) => {
        console.log('[EVAC] response', res);

        this.path = Array.isArray(res?.path) ? res.path : [];
        this.message = res?.message ?? '';
        this.blockedCorridors = Array.isArray(res?.blockedCorridors)
          ? res.blockedCorridors
          : [];

        
        this.router.navigate(['/admin/map'], {
          queryParams: {
            startNode: start,
            showPath: 1, // ✅ showPath (pas showPth)
          },
        });

        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('[EVAC] error', err);

        if (err instanceof HttpErrorResponse) {
          this.errorMsg = err.error?.message ?? err.message ?? 'Errore nel calcolo evacuazione';
        } else {
          this.errorMsg = 'Errore nel calcolo evacuazione';
        }

        this.loading = false;
      },
    });
  }
}
