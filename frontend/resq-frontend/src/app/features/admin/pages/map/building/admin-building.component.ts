import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

type Floor = 'terra' | 'primo' | 'secondo' | 'interrato' | 'rialzato';
type Point = { x: number; y: number };

type CorridorEdge = { fromRoom: string; toRoom: string; blocked: boolean };
type PathSegment = { from: Point; to: Point };

interface UserPositionDto {
  userId: string;
  nodeId: string;
  timestamp: number;
}

interface CorridorApiDto {
  id: number;
  fromNode: string;
  toNode: string;
  weight: number;
  blocked: boolean;
}

@Component({
  selector: 'app-admin-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-building.component.html',
  styleUrls: ['./admin-building.component.css']
})
export class AdminBuildingComponent implements OnInit, OnDestroy {

  building!: string;
  selectedFloor: Floor = 'terra';
  selectedPosition: string = '';

  // Live
  utentiAttivi: UserPositionDto[] = [];
  displayedEdges: CorridorEdge[] = [];

  // Dijkstra (vert) 
  evacuationPathNodes: string[] = [];
  evacuationPathSegmentsForCurrentFloor: PathSegment[] = [];

  // Result "like user"
  recommendedExitId: string | null = null;
  evacuationMessage: string = '';

  private pollingInterval: any;
  private routeSub?: Subscription;
  private lastCorridorsSignatureByBuilding: string = '';
  private hasComputedEvacuation = false;

  // =============================
  // ROOMS (coords en %)
  // IMPORTANT
  // =============================
  ROOMS: Record<string, Record<string, Record<string, Point>>> = {
    A: {
      terra: {
        Entrance: { x: 50, y: 85 },
        Hall: { x: 50, y: 60 },
        Stairs: { x: 15, y: 70 },
        Biblioteca: { x: 25, y: 22 },
        'Sala Studio': { x: 62, y: 58 },
        Exit: { x: 90, y: 80 },
      },
      primo: {
        Hall: { x: 50, y: 60 },
        Stairs: { x: 15, y: 70 },
        'Aula 3': { x: 52, y: 46 },
        'Aula 4': { x: 60, y: 50 },
      },
      secondo: {
        Hall: { x: 50, y: 60 },
        Stairs: { x: 15, y: 70 },
        'Aula 7': { x: 28, y: 35 },
        'Aula 8': { x: 36, y: 38 },
        'Aula 9': { x: 55, y: 48 },
        'Aula 10': { x: 65, y: 32 },
      }
    },

    B: {
      interrato: {
        Entrance: { x: 22, y: 30 },
        'Aula 12': { x: 30, y: 40 },
        'Aula 13': { x: 40, y: 40 },
        'Aula 14': { x: 50, y: 40 },
        Exit: { x: 75, y: 28 },
      },
      rialzato: {
        Entrance: { x: 22, y: 30 },
        'Aula 17': { x: 30, y: 40 },
        'Aula 18': { x: 45, y: 40 },
        'Aula 19': { x: 55, y: 40 },
        'Aula 20': { x: 65, y: 40 },
        'Aula 21': { x: 70, y: 35 },
        Exit: { x: 75, y: 28 }, 
      },
      primo: {
        Ingresso: { x: 22, y: 30 },
        Entrance: { x: 22, y: 30 },
        'Aula 22': { x: 30, y: 45 },
        'Aula 23': { x: 40, y: 45 },
        'Aula 24': { x: 50, y: 45 },
        'Aula 25': { x: 60, y: 45 },
        Exit: { x: 75, y: 28 },
      }
    },

    D: {
      terra: {
        Entrance: { x: 48, y: 70 },
        Portineria: { x: 45, y: 55 },
        'Aula Magna': { x: 35, y: 40 },
        'Aula Minore': { x: 70, y: 38 },
        'Exit East': { x: 80, y: 30 },
        'Exit South': { x: 48, y: 70 },
      }
    }
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(pm => {
      const b = pm.get('building') ?? 'A';
      this.building = b;
      this.selectedFloor = this.getDefaultFloorForBuilding(b);

      this.resetPath();
      this.hasComputedEvacuation = false;
      this.lastCorridorsSignatureByBuilding = '';

      this.refreshAll();
    });

    this.pollingInterval = setInterval(() => this.refreshAll(), 3000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.routeSub?.unsubscribe();
  }

  private getDefaultFloorForBuilding(b: string): Floor {
    if (b === 'A') return 'terra';
    if (b === 'B') return 'interrato';
    if (b === 'D') return 'terra';
    return 'terra';
  }

  private refreshAll() {
    this.fetchUserLocations();
    this.fetchCorridorsLive();
  }

  // =============================
  // CHANGEMENT DE PIANO
  // =============================
  selectFloor(floor: Floor) {
    this.selectedFloor = floor;
    this.fetchUserLocations();
    this.fetchCorridorsLive();

    if (this.hasComputedEvacuation && this.evacuationPathNodes.length > 1) {
      this.buildGreenSegmentsForCurrentFloor(this.evacuationPathNodes);
    } else {
      this.evacuationPathSegmentsForCurrentFloor = [];
    }
  }

  // =============================
  // USERS LIVE
  // =============================
  fetchUserLocations() {
    this.http.get<UserPositionDto[]>('http://localhost:8080/api/user/active-locations')
      .subscribe({
        next: (data) => {
          this.utentiAttivi = (data || []).filter(u => this.isUserOnCurrentView(u.nodeId));
        },
        error: () => this.utentiAttivi = []
      });
  }

  private isUserOnCurrentView(nodeId: string): boolean {
    const parts = nodeId.split('_');
    if (parts.length < 2) return false;

    const bld = parts[0];
    const flrCode = parts[1];

    const floorMap: any = { T: 'terra', '1': 'primo', '2': 'secondo', I: 'interrato', R: 'rialzato', P: 'primo' };
    const floor = floorMap[flrCode] ?? 'terra';

    return bld === this.building && floor === this.selectedFloor;
  }

  getUserStyle(nodeId: string) {
    const roomName = this.nodeToRoomName(nodeId);
    const p = this.getRoomPoint(roomName);
    if (!p) return { display: 'none' };
    return { left: p.x + '%', top: p.y + '%' };
  }

  // =============================
  // CORRIDOI LIVE
  // =============================
  fetchCorridorsLive() {
    this.http.get<CorridorApiDto[]>('http://localhost:8080/api/map/corridors').subscribe({
      next: (corridors) => {
        const allForBuilding = (corridors || []).filter(c =>
          c.fromNode?.startsWith(this.building + '_') && c.toNode?.startsWith(this.building + '_')
        );

        const signature = allForBuilding
          .map(c => `${c.id}:${c.blocked ? 1 : 0}`)
          .sort()
          .join('|');

        const changed = signature !== this.lastCorridorsSignatureByBuilding;
        this.lastCorridorsSignatureByBuilding = signature;

        const filtered = allForBuilding.filter(c => this.isCorridorOnCurrentView(c.fromNode, c.toNode));

        
        this.displayedEdges = filtered
          .map(c => ({
            fromRoom: this.nodeToRoomName(c.fromNode),
            toRoom: this.nodeToRoomName(c.toNode),
            blocked: c.blocked
          }))
          .filter(e => this.getRoomPoint(e.fromRoom) && this.getRoomPoint(e.toRoom));

        
        if (changed && this.hasComputedEvacuation && this.selectedPosition) {
          this.calculateEvacuation(true);
        }
      },
      error: () => {
        this.displayedEdges = [];
      }
    });
  }

  private isCorridorOnCurrentView(fromNode: string, toNode: string): boolean {
    const a = fromNode.split('_');
    const b = toNode.split('_');

    if (a.length < 1 || b.length < 1) return false;
    if (a[0] !== this.building || b[0] !== this.building) return false;

    // D = un seul piano
    if (this.building === 'D') return this.selectedFloor === 'terra';

    if (a.length < 2 || b.length < 2) return false;

    const floorMap: any = { T: 'terra', '1': 'primo', '2': 'secondo', I: 'interrato', R: 'rialzato', P: 'primo' };
    return floorMap[a[1]] === this.selectedFloor && floorMap[b[1]] === this.selectedFloor;
  }

  // =============================
  // MIDPOINT (pour croix rouge)
  // =============================
  midX(e: CorridorEdge): number {
    const a = this.getRoomPoint(e.fromRoom);
    const b = this.getRoomPoint(e.toRoom);
    if (!a || !b) return 0;
    return (a.x + b.x) / 2;
  }

  midY(e: CorridorEdge): number {
    const a = this.getRoomPoint(e.fromRoom);
    const b = this.getRoomPoint(e.toRoom);
    if (!a || !b) return 0;
    return (a.y + b.y) / 2;
  }

  // =============================
  // POSITION SELECT
  // =============================
  getSelectedPositionStyle() {
    if (!this.selectedPosition) return { display: 'none' };
    const p = this.getRoomPoint(this.selectedPosition);
    if (!p) return { display: 'none' };
    return { left: p.x + '%', top: p.y + '%' };
  }

  getCurrentRooms(): string[] {
    return Object.keys(this.ROOMS[this.building]?.[this.selectedFloor] || {});
  }

  getCurrentExits(): string[] {
    const rooms = this.getCurrentRooms();
    return rooms.filter(r => /exit/i.test(r));
  }

  onSelectedPositionChange() {
    this.resetPath();
    this.hasComputedEvacuation = false;
  }

  private resetPath() {
    this.evacuationPathNodes = [];
    this.evacuationPathSegmentsForCurrentFloor = [];
    this.recommendedExitId = null;
    this.evacuationMessage = '';
  }

  // =============================
  // DIJKSTRA (backend)
  // =============================
  calculateEvacuation(silent: boolean = false) {
    if (!this.selectedPosition) return;

    const startNodeId = this.selectedPositionToNodeId();
    const url = `http://localhost:8080/api/map/evacuation?startNode=${encodeURIComponent(startNodeId)}`;

    this.http.get<string[]>(url).subscribe({
      next: (nodes) => {
        this.hasComputedEvacuation = true;

        this.evacuationPathNodes = nodes || [];
        this.buildGreenSegmentsForCurrentFloor(this.evacuationPathNodes);

        const lastNode = this.evacuationPathNodes.length
          ? this.evacuationPathNodes[this.evacuationPathNodes.length - 1]
          : null;

        this.recommendedExitId = lastNode ? this.nodeToRoomName(lastNode) : null;

        this.evacuationMessage = this.recommendedExitId
          ? `Follow the highlighted route to ${this.recommendedExitId}.`
          : 'No evacuation path available.';
      },
      error: () => {
        this.evacuationPathNodes = [];
        this.evacuationPathSegmentsForCurrentFloor = [];
        this.recommendedExitId = null;
        this.evacuationMessage = 'No evacuation path available.';
        if (!silent) {
          
        }
      }
    });
  }

  getEvacuationInstructionsAdmin(): string[] {
    if (!this.evacuationPathNodes || this.evacuationPathNodes.length < 2) return [];

    const rooms = this.evacuationPathNodes.map(n => this.nodeToRoomName(n));
    const compact: string[] = [];
    for (const r of rooms) {
      if (!compact.length || compact[compact.length - 1] !== r) compact.push(r);
    }

    const exit = this.recommendedExitId ?? compact[compact.length - 1];

    const steps: string[] = [];
    steps.push(`Start from: ${compact[0]}.`);

    if (compact.length <= 2) {
      steps.push(`Proceed directly to the exit: ${exit}.`);
    } else {
      steps.push(`Go through: ${compact.slice(1, -1).join(' → ')}.`);
      steps.push(`Reach the recommended exit: ${exit}.`);
    }

    steps.push('Do not use elevators. Use stairs if needed.');
    steps.push('Once outside, reach the assembly point.');
    return steps;
  }

  private buildGreenSegmentsForCurrentFloor(pathNodes: string[]) {
    
    this.evacuationPathSegmentsForCurrentFloor = [];
    if (!pathNodes || pathNodes.length < 2) return;

    const segments: PathSegment[] = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const a = pathNodes[i];
      const b = pathNodes[i + 1];

      const floorA = this.nodeIdToFloor(a);
      const floorB = this.nodeIdToFloor(b);
      if (floorA !== this.selectedFloor || floorB !== this.selectedFloor) continue;

      const roomA = this.nodeToRoomName(a);
      const roomB = this.nodeToRoomName(b);

      const pA = this.ROOMS[this.building]?.[this.selectedFloor]?.[roomA];
      const pB = this.ROOMS[this.building]?.[this.selectedFloor]?.[roomB];
      if (!pA || !pB) continue;

      segments.push({ from: pA, to: pB });
    }

    this.evacuationPathSegmentsForCurrentFloor = segments;
  }
  getBlockedCorridorsCount(): number {
  return (this.displayedEdges || []).filter(e => e.blocked).length;
}

  // =============================
  // MAP image
  // =============================
  get floorImage(): string {
    const MAPS: Record<string, Record<string, string>> = {
      A: {
        terra: '/assets/maps/A/piano-terra.png',
        primo: '/assets/maps/A/primo-piano.png',
        secondo: '/assets/maps/A/secondo-piano.png',
      },
      B: {
        interrato: '/assets/maps/B/Piano-interrato.png',
        rialzato: '/assets/maps/B/Piano-Rialzato.png',
        primo: '/assets/maps/B/Primo-piano (2).png',
      },
      D: {
        terra: '/assets/maps/D/Edificio-D.png',
      }
    };
    return MAPS[this.building]?.[this.selectedFloor] ?? '';
  }

  // =============================
  // Helpers
  // =============================
  private nodeIdToFloor(nodeId: string): Floor {
    if (nodeId.startsWith('D_') || this.building === 'D') return 'terra';

    const parts = nodeId.split('_');
    if (parts.length < 2) return this.selectedFloor;

    const code = parts[1];
    const map: any = { T: 'terra', '1': 'primo', '2': 'secondo', I: 'interrato', R: 'rialzato', P: 'primo' };
    return map[code] ?? this.selectedFloor;
  }

  private nodeToRoomName(nodeId: string): string {
    const parts = nodeId.split('_');
    if (parts.length < 2) return nodeId;

    let rest = parts.slice(1);
    const known = new Set(['T', '1', '2', 'I', 'R', 'P']);
    if (rest.length && known.has(rest[0])) rest = rest.slice(1);
    if (!rest.length) return nodeId;

    
    if (rest[0].toUpperCase() === 'AULA' && rest[1]) return `Aula ${rest[1]}`;
    if (rest.length === 1 && /^\d+$/.test(rest[0])) return `Aula ${rest[0]}`;

    const joined = rest.join('_').toUpperCase();

    if (joined === 'HALL') return 'Hall';
    if (joined === 'STAIRS') return 'Stairs';
    if (joined === 'ENTRANCE') return 'Entrance';
    if (joined === 'INGRESSO') return 'Ingresso';
    if (joined === 'PORTINERIA') return 'Portineria';
    if (joined === 'EXIT') return 'Exit';
    if (joined === 'EXIT_EAST') return 'Exit East';
    if (joined === 'EXIT_SOUTH') return 'Exit South';

    return rest.join(' ')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  private getRoomPoint(roomName: string): Point | null {
    return this.ROOMS[this.building]?.[this.selectedFloor]?.[roomName] ?? null;
  }

  
  private selectedPositionToNodeId(): string {
    const building = this.building;

   
    if (building === 'D') {
      const token = this.normalizeToDbToken(this.selectedPosition);
      return `D_T_${token}`;
    }

    const floorCode = this.floorToDbCode(building, this.selectedFloor);

    const aulaMatch = this.selectedPosition.match(/^Aula\s+(\d+)$/i);
    if (aulaMatch) {
      return `${building}_${floorCode}_AULA_${aulaMatch[1]}`; // ✅
    }

    const token = this.normalizeToDbToken(this.selectedPosition);
    return `${building}_${floorCode}_${token}`;
  }

  private floorToDbCode(building: string, floor: Floor): string {
    if (building === 'B') {
      const mapB: any = { interrato: 'I', rialzato: 'R', primo: 'P' };
      return mapB[floor] ?? 'I';
    }
    const mapA: any = { terra: 'T', primo: '1', secondo: '2' };
    return mapA[floor] ?? 'T';
  }

  private normalizeToDbToken(label: string): string {
    return label
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}