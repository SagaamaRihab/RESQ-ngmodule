import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


import { CorridorsService } from '../../../../core/services/corridors.service';
import { Corridor } from '../../../../core/models/corridor.model';

type Building = 'A' | 'B' | 'D';
type FloorCode = 'T' | '1' | '2' | 'I' | 'R' | 'P';

interface NodeApiDto {
  label: string;
  displayName: string;
}



@Component({
  selector: 'app-corridors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './corridors.component.html',
  styleUrls: ['./corridors.component.css'],
})
export class CorridorsComponent implements OnInit {
  corridoi: Corridor[] = [];
  corridoiFiltrati: Corridor[] = [];

  edificioSelezionato: Building = 'A';
  pianoSelezionato: FloorCode = 'T';
  searchTerm: string = '';

  caricamento = true;
  errore: string | null = null;

  // ✅ Mapping: technical label -> display name (from DB)
  nodeNameById: Record<string, string> = {};
  private nodesLoaded = false;

  constructor(
    private corridorsService: CorridorsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultFloorForBuilding(this.edificioSelezionato);

    // ✅ Load nodes first (display names), then corridors
    this.loadNodes().then(() => {
      this.loadCorridors();
    });
  }

  // =========================
  // NODES (label -> displayName)
  // =========================
  private async loadNodes(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<NodeApiDto[]>('/api/map/nodes').subscribe({
        next: (nodes) => {
          this.nodeNameById = {};
          (nodes || []).forEach((n) => {
            this.nodeNameById[n.label] = n.displayName || n.label;
          });
          this.nodesLoaded = true;
          resolve();
        },
        error: (err) => {
          console.error('Error loading nodes', err);
          this.nodeNameById = {};
          this.nodesLoaded = true; // allow UI to work with fallback
          resolve();
        },
      });
    });
  }

  // ✅ Used by HTML to show friendly labels
  nodeDisplayName(id: string): string {
    return this.nodeNameById[id] ?? id;
  }

  // =========================
  // LOAD CORRIDORS
  // =========================
  loadCorridors(): void {
    this.caricamento = true;
    this.errore = null;

    this.corridorsService
      .getCorridors()
      .pipe(
        finalize(() => {
          this.caricamento = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.corridoi = data ?? [];
          this.applyFilters();
        },
        error: (err) => {
          this.errore = 'Server loading error';
          console.error(err);
          this.corridoi = [];
          this.corridoiFiltrati = [];
        },
      });
  }

  // =========================
  // UI EVENTS
  // =========================
  onBuildingChange(b: Building) {
    this.edificioSelezionato = b;
    this.setDefaultFloorForBuilding(b);
    this.applyFilters();
  }

  onFloorChange(value: string) {
    const mapped = this.normalizeFloorValue(value);
    if (mapped) this.pianoSelezionato = mapped;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  // =========================
  // FILTERS
  // =========================
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.corridoiFiltrati = (this.corridoi || []).filter((c) => {
      const from = (c.fromNode || '').trim();
      const to = (c.toNode || '').trim();
      if (!from) return false;

      const parts = from.split('_');
      const bld = (parts[0] || '') as Building;

      // 1) building
      if (bld !== this.edificioSelezionato) return false;

      // 2) floor
      let matchesFloor = true;

      if (this.edificioSelezionato !== 'D') {
        if (parts.length < 2) return false;
        const flr = parts[1] as FloorCode;
        matchesFloor = flr === this.pianoSelezionato;
      }

      if (!matchesFloor) return false;

      // 3) search (search in technical + friendly names)
      if (!term) return true;

      const fromFriendly = this.nodeDisplayName(from).toLowerCase();
      const toFriendly = this.nodeDisplayName(to).toLowerCase();

      return (
        from.toLowerCase().includes(term) ||
        to.toLowerCase().includes(term) ||
        fromFriendly.includes(term) ||
        toFriendly.includes(term) ||
        String(c.id ?? '').includes(term)
      );
    });

    this.cdr.detectChanges();
  }

  // =========================
  // TOGGLE BLOCK/UNBLOCK
  // =========================
  toggleCorridor(c: Corridor): void {
    const old = c.blocked;
    c.blocked = !c.blocked; // ✅ update immediate UI
    this.applyFilters();

    const req = old
      ? this.corridorsService.unblockCorridor(c.id)
      : this.corridorsService.blockCorridor(c.id);

    req.subscribe({
      next: () => this.loadCorridors(), // ✅ sync true state
      error: (e) => {
        console.error(e);
        c.blocked = old; // rollback
        this.applyFilters();
      },
    });
  }

  // =========================
  // HELPERS
  // =========================
  private setDefaultFloorForBuilding(b: Building) {
    // ✅ IMPORTANT: B should start at I
    if (b === 'A') this.pianoSelezionato = 'T';
    if (b === 'B') this.pianoSelezionato = 'I';
    if (b === 'D') this.pianoSelezionato = 'T'; // not used for D
  }

  private normalizeFloorValue(v: string): FloorCode | null {
    const s = (v || '').trim();

    if (s === 'T' || s === '1' || s === '2' || s === 'I' || s === 'R' || s === 'P') {
      return s;
    }

    const lower = s.toLowerCase();
    const map: Record<string, FloorCode> = {
      terra: 'T',
      secondo: '2',
      interrato: 'I',
      rialzato: 'R',
      p: 'P',
    };

    if (lower === 'primo') {
      return this.edificioSelezionato === 'B' ? 'P' : '1';
    }

    return map[lower] ?? null;
  }
}