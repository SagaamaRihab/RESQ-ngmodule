import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { CorridorsService } from './corridors.service';
import { CorridorDto } from './corridor.dto';

@Component({
  selector: 'app-corridors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corridors.html',
  styleUrls: ['./corridors.css'],
})
export class CorridorsComponent implements OnInit {
  corridoi: CorridorDto[] = [];
  caricamento = true;
  errore: string | null = null;

  constructor(private corridorsService: CorridorsService) {}

  ngOnInit(): void {
    this.loadCorridors();
  }

  loadCorridors(): void {
    this.caricamento = true;
    this.errore = null;

    this.corridorsService
      .getCorridors()
      .pipe(finalize(() => (this.caricamento = false)))
      .subscribe({
        next: (data) => (this.corridoi = data ?? []),
        error: (err: unknown) => {
          console.error('[CorridorsComponent] load ERROR', err);
          this.errore = 'Errore di caricamento corridoi';
        },
      });
  }

  toggleCorridor(c: CorridorDto): void {
    if (c.id == null) return;

    const req = c.blocked
      ? this.corridorsService.unblockCorridor(c.id)
      : this.corridorsService.blockCorridor(c.id);

    req.subscribe({
      next: () => this.loadCorridors(),
      error: (err: unknown) => {
        console.error('[CorridorsComponent] toggle ERROR', err);
        this.errore = 'Errore durante blocco/sblocco corridoio';
      },
    });
  }
}
