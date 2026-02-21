import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { MapService } from '../map/map.service';
import { EvacuationService, EvacuationResponse } from './evacuation.service';

type BuildingKey = 'A' | 'B' | 'D';

@Component({
  selector: 'app-evacuations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evacuations.html',
  styleUrls: ['./evacuations.css'],
})
export class EvacuationsComponent implements OnInit {
  loading = false;
  errorMsg = '';
  message = '';

  buildings: { key: BuildingKey; label: string }[] = [
    { key: 'A', label: 'Edificio A' },
    { key: 'B', label: 'Edificio B' },
    { key: 'D', label: 'Edificio D' },
  ];

  building: BuildingKey = 'A';

  nodes: string[] = [];
  startNode = '';

  // (Opzionale) se vuoi mostrare qualcosa prima della redirezione
  path: string[] = [];
  blockedCorridors: string[] = [];

  constructor(
    private mapService: MapService,
    private evacuationService: EvacuationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNodes();
  }

  // ✅ chiamato quando cambia l’edificio selezionato
  onBuildingChange(): void {
    this.startNode = '';
    this.nodes = [];
    this.path = [];
    this.blockedCorridors = [];
    this.message = '';
    this.errorMsg = '';
    this.loadNodes();
  }

  // ✅ verifica se un nodo appartiene all’edificio selezionato
  private nodeBelongsToSelectedBuilding(node: any, label: string): boolean {
    // 1) Se la mappa fornisce un campo building/edificio/buildingKey → quello è prioritario
    const b = node?.building ?? node?.edificio ?? node?.buildingKey ?? null;
    if (typeof b === 'string' && b.length > 0) {
      return b.toUpperCase() === this.building;
    }

    // 2) Fallback: spesso l’etichetta del nodo inizia con A/B/D (es: A_..., B_..., D_...)
    const first = (label ?? '').trim().charAt(0).toUpperCase();
    return first === this.building;
  }

  // ✅ carica i nodi disponibili filtrandoli per edificio selezionato
  loadNodes(): void {
    this.mapService.getMap().subscribe({
      next: (data: any) => {
        const nodesRaw = Array.isArray(data?.nodes) ? data.nodes : [];

        const labels: string[] = nodesRaw
          .map((n: any) => ({
            node: n,
            label: typeof n?.label === 'string' ? n.label.trim() : '',
          }))
          .filter((x: any) => x.label.length > 0)
          .filter((x: any) => this.nodeBelongsToSelectedBuilding(x.node, x.label))
          .map((x: any) => x.label);

        this.nodes = Array.from(new Set<string>(labels)).sort();

        // ✅ coerenza: se lo startNode non è più valido, lo azzeriamo
        if (!this.nodes.includes(this.startNode)) {
          this.startNode = '';
        }
      },
      error: () => {
        this.nodes = [];
        this.startNode = '';
      },
    });
  }

  /**
   * ✅ Iterazione 0:
   * - calcola l’evacuazione dal nodo selezionato
   * - poi reindirizza automaticamente alla mappa
   * - passando startNode + showPath=1 (IMPORTANTE: showPath, non showPth)
   */
  computeAndGoToMap(): void {
    const start = (this.startNode ?? '').trim();
    if (!start) return;

    this.loading = true;
    this.errorMsg = '';
    this.message = '';
    this.path = [];
    this.blockedCorridors = [];

    this.evacuationService
      .compute(start)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: EvacuationResponse) => {
          this.path = Array.isArray(res?.path) ? res.path : [];
          this.message = res?.message ?? '';
          this.blockedCorridors = Array.isArray(res?.blockedCorridors)
            ? res.blockedCorridors
            : [];

          // ✅ reindirizzamento SEMPRE se startNode è presente
          this.router.navigate(['/admin/map'], {
            queryParams: { startNode: start, showPath: 1 },
          });
        },
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            this.errorMsg =
              err.error?.message ?? err.message ?? 'Errore nel calcolo del percorso';
          } else {
            this.errorMsg = 'Errore nel calcolo del percorso';
          }
        },
      });
  }
}
