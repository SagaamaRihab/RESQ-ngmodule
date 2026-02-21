// src/app/features/admin/map/map.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { MapService, MapDTO, CorridorDTO } from './map.service';

type Point = { x: number; y: number };

type FloorKey =
  | 'B_INTERRATO'
  | 'B_RIALZATO'
  | 'B_PRIMO'
  | 'A_PIANO_TERRA'
  | 'A_PRIMO_PIANO'
  | 'A_SECONDO_PIANO'
  | 'D_PIANO_TERRA';

type FloorConfig = {
  key: FloorKey;
  label: string;
  imageUrl: string;
  width: number;
  height: number;
  nodePos: Record<string, Point>;
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class Map implements OnInit, OnDestroy {
  mapData: MapDTO | null = null;

  loading = false;
  errorMsg = '';

  evacStartNode = '';
  evacPath: string[] = [];
  evacLoading = false;
  evacError = '';

  instructions: { text: string }[] = [];

  private autoRecalcSub?: Subscription;
  private readonly AUTO_RECALC_MS = 2500;
  private lastBlockedSignature = '';

  showRecalcBadge = false;
  recalcReason = '';
  highlightPath = false;

  private computeOrigin: 'manual' | 'auto' | 'query' = 'manual';
    // ✅ Collegamenti verticali (scale / connessioni tra piani)

  private readonly verticalLinks: Array<{ from: string; to: string; weight?: number }> = [
    
    { from: 'A_2_STAIRS', to: 'A_1_STAIRS', weight: 1 },
    { from: 'A_1_STAIRS', to: 'A_T_STAIRS', weight: 1 },

   
    { from: 'B_P_ENTRANCE', to: 'B_R_ENTRANCE', weight: 1 },
    { from: 'B_R_ENTRANCE', to: 'B_I_ENTRANCE', weight: 1 },
  ];

  floors: FloorConfig[] = [
    {
      key: 'B_INTERRATO',
      label: 'Edificio B - Piano Interrato',
      imageUrl: 'assets/template/maps/B_interrato.png',
      width: 1200,
      height: 700,
      nodePos: {
        B_I_ENTRANCE: { x: 180, y: 320 },
        B_I_12: { x: 480, y: 320 },
        B_I_13: { x: 600, y: 320 },
        B_I_14: { x: 720, y: 320 },
        B_I_EXIT: { x: 980, y: 320 },
      },
    },
    {
      key: 'B_RIALZATO',
      label: 'Edificio B - Piano Rialzato',
      imageUrl: 'assets/template/maps/B_rialzato.png',
      width: 1200,
      height: 700,
      nodePos: {
        B_R_ENTRANCE: { x: 260, y: 235 },
        B_R_17: { x: 560, y: 225 },
        B_R_18: { x: 660, y: 225 },
        B_R_19: { x: 760, y: 225 },
        B_R_20: { x: 1090, y: 170 },
        B_R_21: { x: 1090, y: 300 },
        B_R_21_A: { x: 1090, y: 410 },
      },
    },
    {
      key: 'B_PRIMO',
      label: 'Edificio B - Primo Piano',
      imageUrl: 'assets/template/maps/B_primo.png',
      width: 1200,
      height: 700,
      nodePos: {
        B_P_ENTRANCE: { x: 260, y: 230 },
        B_P_22: { x: 540, y: 220 },
        B_P_23: { x: 640, y: 220 },
        B_P_24: { x: 740, y: 220 },
        B_P_25: { x: 840, y: 220 },
        B_P_EXIT: { x: 1030, y: 260 },
      },
    },
    {
      key: 'A_PIANO_TERRA',
      label: 'Edificio A - Piano Terra',
      imageUrl: 'assets/template/maps/A_piano_terra.png',
      width: 1200,
      height: 700,
      nodePos: {
        A_T_ENTRANCE: { x: 600, y: 620 },
        A_T_HALL: { x: 600, y: 380 },
        A_T_STAIRS: { x: 600, y: 470 },
        A_T_BIBLIOTECA: { x: 420, y: 200 },
        A_T_SALA_STUDIO: { x: 820, y: 420 },
      },
    },
    {
      key: 'A_PRIMO_PIANO',
      label: 'Edificio A - Primo Piano',
      imageUrl: 'assets/template/maps/A_primo_piano.png',
      width: 1200,
      height: 700,
      nodePos: {
        A_1_STAIRS: { x: 600, y: 520 },
        A_1_HALL: { x: 600, y: 360 },
        A_1_AULA_3: { x: 780, y: 360 },
        A_1_AULA_4: { x: 900, y: 360 },
      },
    },
    {
      key: 'A_SECONDO_PIANO',
      label: 'Edificio A - Secondo Piano',
      imageUrl: 'assets/template/maps/A_secondo_piano.png',
      width: 1200,
      height: 700,
      nodePos: {
        A_2_STAIRS: { x: 600, y: 360 },
        A_2_HALL: { x: 600, y: 360 },
        A_2_AULA_7: { x: 500, y: 480 },
        A_2_AULA_8: { x: 700, y: 480 },
        A_2_AULA_9: { x: 500, y: 200 },
        A_2_AULA_10: { x: 700, y: 200 },
      },
    },
    {
      key: 'D_PIANO_TERRA',
      label: 'Edificio D - Piano Terra',
      imageUrl: 'assets/template/maps/Edificio_D.png',
      width: 1200,
      height: 700,
      nodePos: {
        D_ENTRANCE: { x: 600, y: 520 },
        D_PORTINERIA: { x: 600, y: 400 },
        D_AULA_MAGNA: { x: 360, y: 300 },
        D_AULA_MINORE: { x: 820, y: 300 },
        D_EXIT_SOUTH: { x: 600, y: 640 },
        D_EXIT_EAST: { x: 1020, y: 360 },
        D_STAIRS: { x: 600, y: 460 },
      },
    },
  ];

  selectedFloorKey: FloorKey = 'B_INTERRATO';

  private pendingStartNode = '';
  private pendingShowPath = false;
  private mapLoaded = false;

  constructor(private mapService: MapService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadMap();

    this.route.queryParamMap.subscribe((params) => {
      const start = (params.get('startNode') ?? '').trim();
      const showPath = params.get('showPath') === '1' || params.get('showPath') === 'true';

      this.pendingStartNode = start;
      this.pendingShowPath = showPath;

      if (this.mapLoaded) this.applyQueryEvacuation();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRecalculation();
  }

  get selectedFloor(): FloorConfig {
    return this.floors.find((f) => f.key === this.selectedFloorKey) ?? this.floors[0];
  }

  get floorNodes(): string[] {
    return Object.keys(this.selectedFloor.nodePos);
  }

  get blockedCorridorsCount(): number {
    return (this.mapData?.corridors ?? []).filter((c) => c.blocked).length;
  }


  onFloorChange(key: string, keepEvac = false): void {
    this.selectedFloorKey = key as FloorKey;

    if (!keepEvac) {
      this.evacStartNode = '';
      this.evacPath = [];
      this.evacError = '';
      this.instructions = [];
      this.stopAutoRecalculation();
      this.clearFeedback();
    }
  }

  loadMap(): void {
    this.loading = true;
    this.errorMsg = '';

    this.mapService.getMap().subscribe({
      next: (data: MapDTO) => {
        this.mapData = this.normalizeMap(data);
        this.loading = false;

        this.lastBlockedSignature = this.computeBlockedSignature(this.mapData);

        this.mapLoaded = true;
        this.applyQueryEvacuation();
      },
      error: (err: unknown) => {
        console.error('[Map] ERROR:', err);
        this.errorMsg = err instanceof HttpErrorResponse ? err.message : 'Errore nel caricamento mappa';
        this.loading = false;
        this.mapLoaded = false;
      },
    });
  }

  pos(label: string): Point {
    return this.selectedFloor.nodePos[label] ?? { x: 60, y: 60 };
  }

  // ✅ Un nodo è "bloccato" se TUTTI i suoi corridoi (su QUESTO piano) sono bloccati
 
  isNodeBlocked(nodeLabel: string): boolean {
    if (!this.mapData) return false;

  // consideriamo solo i nodi visibili sul piano corrente

    if (!Object.prototype.hasOwnProperty.call(this.selectedFloor.nodePos, nodeLabel)) return false;

    const floorNodeSet = new Set(Object.keys(this.selectedFloor.nodePos));

    const relatedCorridors = (this.mapData.corridors ?? []).filter(
      (c) =>
        (c.fromNode === nodeLabel || c.toNode === nodeLabel) &&
  // il corridoio deve appartenere interamente a questo piano (altrimenti il calcolo è errato)

        floorNodeSet.has(c.fromNode) &&
        floorNodeSet.has(c.toNode)
    );

    if (relatedCorridors.length === 0) return false;

    return relatedCorridors.every((c) => c.blocked);
  }

  toggleCorridor(c: CorridorDTO): void {
    if (c.id == null) return;

    const req = c.blocked ? this.mapService.unblockCorridor(c.id) : this.mapService.blockCorridor(c.id);

    req.subscribe({
      next: () => {
        this.loadMap();
        if (this.evacStartNode) {
          this.computeOrigin = 'manual';
          this.computeEvacuationInternal();
        }
      },
      error: (err: unknown) => {
        console.error('[Map] toggle ERROR', err);
        this.errorMsg = 'Errore durante blocco/sblocco corridoio';
      },
    });
  }

  computeEvacuation(): void {
    this.computeOrigin = 'manual';
    this.computeEvacuationInternal();
  }

  private computeEvacuationInternal(): void {
    if (this.evacLoading) return;

    this.evacError = '';
    this.evacPath = [];
    this.instructions = [];


    if (!this.evacStartNode) return;

    this.evacLoading = true;

    this.mapService.getEvacuationPath(this.evacStartNode).subscribe({
      next: (res: any) => {
        const path =
          Array.isArray(res) ? res :
          Array.isArray(res?.path) ? res.path :
          Array.isArray(res?.nodes) ? res.nodes :
          Array.isArray(res?.percorso) ? res.percorso :
          Array.isArray(res?.route) ? res.route :
          [];

        this.evacPath = path;

        
        this.evacError = '';

        this.instructions = this.buildInstructions(this.evacPath);
        this.evacLoading = false;

        if (this.computeOrigin === 'auto' && this.evacPath.length > 0) {
          this.fireRecalcFeedback('🚨 Percorso ricalcolato: corridoio bloccato');
        }

        this.startAutoRecalculation();
        this.computeOrigin = 'manual';
      },
      error: (err: unknown) => {
        console.error('[Map] evacuation ERROR', err);
        // manteniamo solo i veri errori provenienti dal server
        this.evacError = err instanceof HttpErrorResponse ? err.message : 'Errore nel calcolo evacuazione';
        this.evacLoading = false;
        this.computeOrigin = 'manual';
      },
    });
  }

  resetEvacuation(): void {
    this.evacPath = [];
    this.evacError = '';
    this.instructions = [];
    this.stopAutoRecalculation();
    this.clearFeedback();
  }

  get evacPoints(): string {
    return (this.evacPath ?? [])
      .map((label) => this.selectedFloor.nodePos[label])
      .filter((p): p is Point => !!p)
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  }

  onMapClick(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const x = (ev.clientX - rect.left) * scaleX;
    const y = (ev.clientY - rect.top) * scaleY;

    console.log(`[MAP] Floor=${this.selectedFloorKey} SVG x,y = ${x.toFixed(1)}, ${y.toFixed(1)}`);
  }

  private startAutoRecalculation(): void {
    if (!this.evacStartNode) return;

    this.stopAutoRecalculation();

    this.autoRecalcSub = interval(this.AUTO_RECALC_MS).subscribe(() => {
      if (!this.evacStartNode) return;

      this.mapService.getMap().subscribe({
        next: (data: MapDTO) => {
          const normalized = this.normalizeMap(data);
          const newSig = this.computeBlockedSignature(normalized);

          this.mapData = normalized;

          if (newSig === this.lastBlockedSignature) return;
          this.lastBlockedSignature = newSig;

          if (this.isCurrentPathAffectedByBlocked(normalized)) {
            this.computeOrigin = 'auto';
            this.computeEvacuationInternal();
          }
        },
        error: () => {},
      });
    });
  }

  private stopAutoRecalculation(): void {
    this.autoRecalcSub?.unsubscribe();
    this.autoRecalcSub = undefined;
  }

  private computeBlockedSignature(m: MapDTO | null): string {
    const cs = m?.corridors ?? [];
    const ids = cs
      .filter((c) => c.blocked)
      .map((c) => String(c.id ?? `${c.fromNode}-${c.toNode}`))
      .sort();
    return ids.join('|');
  }

  private isCurrentPathAffectedByBlocked(m: MapDTO): boolean {
    if (!this.evacPath || this.evacPath.length < 2) return false;

    const pathEdges = new Set<string>();
    for (let i = 0; i < this.evacPath.length - 1; i++) {
      const a = this.evacPath[i];
      const b = this.evacPath[i + 1];
      pathEdges.add(`${a}->${b}`);
      pathEdges.add(`${b}->${a}`);
    }

    return (m.corridors ?? [])
      .filter((c) => c.blocked)
      .some((c) => pathEdges.has(`${c.fromNode}->${c.toNode}`) || pathEdges.has(`${c.toNode}->${c.fromNode}`));
  }

  private floorKeyForNode(label: string): FloorKey | null {
    for (const f of this.floors) {
      if (Object.prototype.hasOwnProperty.call(f.nodePos, label)) return f.key;
    }
    return null;
  }

 
  private applyQueryEvacuation(): void {
    const start = (this.pendingStartNode ?? '').trim();
    if (!start) return;

    const fk = this.floorKeyForNode(start);
    if (fk && fk !== this.selectedFloorKey) {
      this.onFloorChange(fk, true); // ✅ keepEvac = true
    }

    this.evacStartNode = start;

    if (this.pendingShowPath) {
      this.computeOrigin = 'query';
      this.computeEvacuationInternal();
      this.computeOrigin = 'manual';
    }
  }

  private fireRecalcFeedback(reason: string): void {
    this.recalcReason = reason;
    this.showRecalcBadge = true;
    this.highlightPath = true;

    setTimeout(() => (this.showRecalcBadge = false), 2800);
    setTimeout(() => (this.highlightPath = false), 900);
  }

  private clearFeedback(): void {
    this.showRecalcBadge = false;
    this.recalcReason = '';
    this.highlightPath = false;
  }

  private buildInstructions(path: string[]): { text: string }[] {
    if (!path || path.length < 2) return [];

    const out: { text: string }[] = [{ text: `Parti da ${path[0]}` }];

    for (let i = 0; i < path.length - 1; i++) {
      const b = path[i + 1];

      if (b.includes('STAIRS') || b.includes('SCALE')) out.push({ text: `Vai verso le scale (${b})` });
      else if (b.includes('EXIT') || b.includes('USCITA')) out.push({ text: `Raggiungi l’uscita (${b})` });
      else out.push({ text: `Prosegui fino a ${b}` });
    }

    out.push({ text: '✅ Sei arrivato in una zona di uscita.' });
    return out;
  }

      private normalizeMap(data: MapDTO): MapDTO {
    //  IMPORTANTE: cloniamo l’array per poter aggiungere nuovi elementi

    const corridors: any[] = (data?.corridors ?? []).slice();
    let nodes = data?.nodes ?? [];

    /// 1) Aggiunta dei collegamenti verticali se non esistono già

    for (const link of this.verticalLinks) {
      const exists = corridors.some(
        (c) =>
          (c.fromNode === link.from && c.toNode === link.to) ||
          (c.fromNode === link.to && c.toNode === link.from)
      );

      if (!exists) {
        corridors.push({
          id: undefined,
          fromNode: link.from,
          toNode: link.to,
          blocked: false,
          weight: link.weight ?? 1,
        });
      }
    }

    

    if (!nodes || nodes.length === 0) {
      const labels = new Set<string>();
      for (const c of corridors) {
        labels.add(c.fromNode);
        labels.add(c.toNode);
      }
      nodes = Array.from(labels).map((label) => ({ label }));
    } else {
      

      const nodeSet = new Set(nodes.map((n) => n.label));
      for (const link of this.verticalLinks) {
        if (!nodeSet.has(link.from)) {
          nodes.push({ label: link.from } as any);
          nodeSet.add(link.from);
        }
        if (!nodeSet.has(link.to)) {
          nodes.push({ label: link.to } as any);
          nodeSet.add(link.to);
        }
      }
    }

    return { nodes, corridors } as any;
  }
}