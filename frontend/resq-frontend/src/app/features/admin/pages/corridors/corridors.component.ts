import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CorridorsService } from '../../../../core/services/corridors.service';
import { Corridor } from '../../../../core/models/corridor.model';

type Building = 'A' | 'B' | 'D';
type FloorCode = 'T' | '1' | '2' | 'I' | 'R' | 'P';

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

  // ✅ cohérent avec tes nodes DB (A_T_..., B_I_..., B_P_..., etc.)
  edificioSelezionato: Building = 'A';
  pianoSelezionato: FloorCode = 'T';

  searchTerm: string = '';

  caricamento = true;
  errore: string | null = null;

  constructor(
    private corridorsService: CorridorsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ au démarrage : s’assurer que le piano correspond au building
    this.setDefaultFloorForBuilding(this.edificioSelezionato);
    this.loadCorridors();
  }

  // =========================
  // LOAD
  // =========================
  loadCorridors(): void {
    this.caricamento = true;
    this.errore = null;

    this.corridorsService.getCorridors()
      .pipe(finalize(() => {
        this.caricamento = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.corridoi = data ?? [];
          this.applyFilters();
        },
        error: (err) => {
          this.errore = 'Errore di caricamento dal server';
          console.error(err);
          this.corridoi = [];
          this.corridoiFiltrati = [];
        }
      });
  }

  // =========================
  // UI EVENTS (à appeler depuis le HTML)
  // =========================

  /** Appelé quand tu cliques Edificio A/B/D */
  onBuildingChange(b: Building) {
    this.edificioSelezionato = b;
    this.setDefaultFloorForBuilding(b);
    this.applyFilters();
  }

  /** Appelé quand tu changes le select du piano */
  onFloorChange(value: string) {
    // accepte soit "T/I/R/P/1/2" soit "terra/interrato/rialzato/primo/secondo"
    const mapped = this.normalizeFloorValue(value);
    if (mapped) this.pianoSelezionato = mapped;
    this.applyFilters();
  }

  /** Appelé quand tu changes la recherche */
  onSearchChange() {
    this.applyFilters();
  }

  // =========================
  // FILTERS
  // =========================
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.corridoiFiltrati = (this.corridoi || []).filter(c => {
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
        // attendu: A_T_..., A_1_..., B_I_..., B_P_...
        if (parts.length < 2) return false;

        const flr = parts[1] as FloorCode;
        matchesFloor = (flr === this.pianoSelezionato);
      }

      if (!matchesFloor) return false;

      // 3) search
      if (!term) return true;

      return (
        from.toLowerCase().includes(term) ||
        to.toLowerCase().includes(term) ||
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
  c.blocked = !c.blocked;           // ✅ update immédiat UI
  this.applyFilters();

  const req = old
    ? this.corridorsService.unblockCorridor(c.id)
    : this.corridorsService.blockCorridor(c.id);

  req.subscribe({
    next: () => this.loadCorridors(),  // ✅ sync vrai état
    error: (e) => {
      console.error(e);
      c.blocked = old;                // rollback
      this.applyFilters();
    }
  });
}

  // =========================
  // HELPERS
  // =========================
  private setDefaultFloorForBuilding(b: Building) {
    // ✅ IMPORTANT: B doit démarrer à I sinon la liste est vide
    if (b === 'A') this.pianoSelezionato = 'T';
    if (b === 'B') this.pianoSelezionato = 'I';
    if (b === 'D') this.pianoSelezionato = 'T'; // valeur sans importance, car D ignore le piano
  }

  private normalizeFloorValue(v: string): FloorCode | null {
    const s = (v || '').trim();

    // déjà un code DB
    if (s === 'T' || s === '1' || s === '2' || s === 'I' || s === 'R' || s === 'P') {
      return s;
    }

    // sinon mapping depuis libellé UI
    const lower = s.toLowerCase();
    const map: Record<string, FloorCode> = {
      terra: 'T',
      primo: '1',      // ⚠️ pour A
      secondo: '2',
      interrato: 'I',
      rialzato: 'R',
      // ⚠️ pour B, le "primo" est souvent P en DB
      p: 'P',
    };

    // si ton UI envoie "primo" pour B, on ne sait pas si c’est A(1) ou B(P)
    // => on décide selon edificioSelezionato
    if (lower === 'primo') {
      return this.edificioSelezionato === 'B' ? 'P' : '1';
    }

    return map[lower] ?? null;
  }
}