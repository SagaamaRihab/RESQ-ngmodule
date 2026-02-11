import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD:frontend/resq-frontend/src/app/features/user/pages/evacuation/evacuation.component.ts

import { EvacuationService } from '../../../../core/services/evacuation.service';
import { EvacuationResponse } from '../../../../core/models/evacuation-response.model';
import { PathViewerComponent } from '../../../../shared/components/path-viewer/path-viewer.component';
=======
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


import { EvacuationService, EvacuationResponse} from '../admin/evacuations/evacuation.service';
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17:frontend/resq-frontend/src/app/features/evacuation/evacuation.component.ts

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],
})
<<<<<<< HEAD:frontend/resq-frontend/src/app/features/user/pages/evacuation/evacuation.component.ts
export class EvacuationComponent implements OnInit {
=======
export class EvacuationComponent {
  loading = false;
  errorMsg = '';
  message = '';
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17:frontend/resq-frontend/src/app/features/evacuation/evacuation.component.ts

  startNode = '';
  path: string[] = [];
  blockedCorridors: string[] = [];

  constructor(
    private evacuationService: EvacuationService,
    private router: Router
  ) {}

<<<<<<< HEAD:frontend/resq-frontend/src/app/features/user/pages/evacuation/evacuation.component.ts
  calculate(): void {

  console.log('CLICK CALCOLA');

  this.error = null;
  this.response = null;
  this.loading = true;

  if (!this.startNode.trim()) {
    this.error = 'Inserisci un nodo di partenza';
    this.loading = false;
    return;
  }

  this.evacuationService
    .calculateEvacuation(this.startNode.trim())
    .subscribe({

      next: (res) => {
        console.log('RISPOSTA SERVER:', res);

        this.response = res;
=======
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

>>>>>>> d12f3495f6000279035466c8b05ea12879007f17:frontend/resq-frontend/src/app/features/evacuation/evacuation.component.ts
        this.loading = false;

        localStorage.removeItem('startNode');
      },
<<<<<<< HEAD:frontend/resq-frontend/src/app/features/user/pages/evacuation/evacuation.component.ts

      error: (err) => {
        console.error('ERRORE:', err);

        this.error = 'Errore nel calcolo del percorso';
        this.loading = false;
      },

      complete: () => {
        console.log('COMPLETATO');
        this.loading = false;
      }
    });
}


  ngOnInit(): void {

      const saved = localStorage.getItem('startNode');

      if (saved) {
        this.startNode = saved;

        this.calculate();
      }

  }


=======
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
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17:frontend/resq-frontend/src/app/features/evacuation/evacuation.component.ts
}
