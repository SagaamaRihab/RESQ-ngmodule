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

/** Used to generate human instructions from node ids */
type StepInfo = { building: string; floor: Floor; room: string; raw: string };

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

  // Dijkstra path (nodes + green segments on current floor)
  evacuationPathNodes: string[] = [];
  evacuationPathSegmentsForCurrentFloor: PathSegment[] = [];

  // Result like user
  recommendedExitId: string | null = null;
  evacuationMessage: string = '';

  private pollingInterval: any;
  private routeSub?: Subscription;
  private lastCorridorsSignatureByBuilding: string = '';
  private hasComputedEvacuation = false;

  // =============================
  // ROOMS (coords in %)
  // =============================
  ROOMS: Record<string, Record<string, Record<string, Point>>> = {
    A: {
      terra: {
        Entrance: { x: 50, y: 85 },
        Hall: { x: 50, y: 60 },
        Stairs: { x: 15, y: 70 },
        Biblioteca: { x: 25, y: 22 },
        'Sala Studio': { x: 62, y: 58 },
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
        'Bagno Femminile': { x: 20, y: 25 }
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
  // FLOOR CHANGE
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
  // LIVE USERS
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
    const parsed = this.parseNodeId(nodeId);
    if (!parsed) return false;
    return parsed.building === this.building && parsed.floor === this.selectedFloor;
  }

  getUserStyle(nodeId: string) {
    const roomName = this.nodeToRoomName(nodeId);
    const p = this.getRoomPoint(roomName);
    if (!p) return { display: 'none' };
    return { left: p.x + '%', top: p.y + '%' };
  }

  // =============================
  // CORRIDORS LIVE
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

        // auto-recalc only if already computed once
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
    const a = this.parseNodeId(fromNode);
    const b = this.parseNodeId(toNode);
    if (!a || !b) return false;

    if (a.building !== this.building || b.building !== this.building) return false;
    return a.floor === this.selectedFloor && b.floor === this.selectedFloor;
  }

  // =============================
  // MIDPOINT (for red X)
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

  getBlockedCorridorsCount(): number {
    return (this.displayedEdges || []).filter(e => e.blocked).length;
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
  // EVACUATION API
  // =============================
  calculateEvacuation(silent: boolean = false) {
    if (!this.selectedPosition) return;

    const startNodeId = this.selectedPositionToNodeId();
    const url = `http://localhost:8080/api/evacuation/from/${encodeURIComponent(startNodeId)}`;

    this.http.get<{ path: string[]; message: string }>(url).subscribe({
    next: (res) => {
    this.hasComputedEvacuation = true;
    this.evacuationPathNodes = res?.path || [];

    this.buildGreenSegmentsForCurrentFloor(this.evacuationPathNodes);

    const lastNode = this.evacuationPathNodes.length
      ? this.evacuationPathNodes[this.evacuationPathNodes.length - 1]
      : null;

    this.recommendedExitId = lastNode ? this.nodeToRoomName(lastNode) : null;
    this.evacuationMessage = res?.message || (this.recommendedExitId
      ? `Follow the highlighted route to ${this.recommendedExitId}.`
      : 'No evacuation path available.');
  },
  error: () => {
    this.resetPath();
    this.evacuationMessage = 'No evacuation path available.';
  }
});
  }

  /**
   * Human instructions:
   * - Mentions start floor
   * - Says go left/right based on coordinates (approx.)
   * - Says go up/down when changing floors (stairs)
   * - Works also when starting from 2nd floor
   */
  getEvacuationInstructionsAdmin(): string[] {
    if (!this.evacuationPathNodes || this.evacuationPathNodes.length < 2) return [];

    const steps = this.evacuationPathNodes
      .map(n => this.parseNodeId(n))
      .filter(Boolean) as StepInfo[];

    if (steps.length < 2) return [];

    const out: string[] = [];

    const start = steps[0];
    out.push(`Exit from ${start.room}.`);
    out.push(`You are on ${this.floorLabel(start.floor)} (Building ${start.building}).`);

    for (let i = 0; i < steps.length - 1; i++) {
      const curr = steps[i];
      const next = steps[i + 1];

      // floor change => stairs instruction (up/down)
      if (curr.floor !== next.floor) {
        const move = this.verticalMove(curr.floor, next.floor);
        out.push(`${move} using the stairs (${curr.room}) to reach ${this.floorLabel(next.floor)}.`);
        continue;
      }

      // same floor => left/right/straight based on coordinates (rough)
      const turn = this.turnDirection(curr, next);
      if (turn === 'left') out.push(`Go left towards ${next.room}.`);
      else if (turn === 'right') out.push(`Go right towards ${next.room}.`);
      else out.push(`Go straight towards ${next.room}.`);
    }

    const exitRoom = this.recommendedExitId ?? steps[steps.length - 1].room;
    out.push(`Reach the recommended exit: ${exitRoom}.`);
    out.push('Do not use elevators. Use stairs if needed.');
    out.push('Once outside, reach the assembly point.');

    return out;
  }

  // =============================
  // Build green segments for CURRENT floor only (optional)
  // =============================
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

  // =============================
  // Map image
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
  // Parsing / Helpers
  // =============================
  private parseNodeId(nodeId: string): StepInfo | null {
    if (!nodeId) return null;

    const parts = nodeId.split('_').filter(Boolean);
    if (parts.length < 2) return null;

    const building = parts[0];

    // expected:
    // A_T_HALL
    // A_2_AULA_7
    // B_I_AULA_12
    // D_T_EXIT_SOUTH (you said you now use D_T_*)
    const floorCode = parts[1];
    const floor = this.floorCodeToFloor(floorCode);

    // room token starts after floorCode
    const rest = parts.slice(2).join('_');
    if (!rest) return null;

    // normalize to UI room label
    const room = this.nodeToRoomName(`${building}_${floorCode}_${rest}`);

    return { building, floor, room, raw: nodeId };
  }

  private floorCodeToFloor(code: string): Floor {
    const map: Record<string, Floor> = {
      T: 'terra',
      '1': 'primo',
      '2': 'secondo',
      I: 'interrato',
      R: 'rialzato',
      P: 'primo',
    };
    return map[code] ?? 'terra';
  }

  private nodeIdToFloor(nodeId: string): Floor {
    const parsed = this.parseNodeId(nodeId);
    return parsed?.floor ?? this.selectedFloor;
  }

  private nodeToRoomName(nodeId: string): string {
    const parts = nodeId.split('_');
    if (parts.length < 2) return nodeId;

    // remove building
    let rest = parts.slice(1);

    // remove floor code if present
    const known = new Set(['T', '1', '2', 'I', 'R', 'P']);
    if (rest.length && known.has(rest[0])) rest = rest.slice(1);

    if (!rest.length) return nodeId;

    // AULA patterns
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

    // IMPORTANT: keep consistent with DB node ids
    // Your latest: D_T_{token}
    if (building === 'D') {
      const token = this.normalizeToDbToken(this.selectedPosition);
      return `D_T_${token}`;
    }

    const floorCode = this.floorToDbCode(building, this.selectedFloor);

    const aulaMatch = this.selectedPosition.match(/^Aula\s+(\d+)$/i);
    if (aulaMatch) {
      // IMPORTANT: if your DB uses A_2_AULA_7, keep this:
      return `${building}_${floorCode}_AULA_${aulaMatch[1]}`;
    }

    const token = this.normalizeToDbToken(this.selectedPosition);
    return `${building}_${floorCode}_${token}`;
  }

  private floorToDbCode(building: string, floor: Floor): string {
    if (building === 'B') {
      const mapB: Record<Floor, string> = {
        interrato: 'I',
        rialzato: 'R',
        primo: 'P',
        terra: 'T',
        secondo: '2'
      };
      return (mapB[floor] ?? 'I');
    }

    const mapA: Record<Floor, string> = {
      terra: 'T',
      primo: '1',
      secondo: '2',
      interrato: 'I',
      rialzato: 'R'
    };
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

  // =============================
  // Instruction helpers (NEW)
  // =============================
  private floorLabel(f: Floor): string {
    switch (f) {
      case 'interrato': return 'Basement';
      case 'rialzato': return 'Raised floor';
      case 'terra': return 'Ground floor';
      case 'primo': return 'First floor';
      case 'secondo': return 'Second floor';
      default: return f;
    }
  }

  private verticalMove(from: Floor, to: Floor): string {
    const rank: Record<Floor, number> = {
      interrato: 0,
      rialzato: 1,
      terra: 2,
      primo: 3,
      secondo: 4,
    };
    const a = rank[from] ?? 0;
    const b = rank[to] ?? 0;
    if (b < a) return 'Go down';
    if (b > a) return 'Go up';
    return 'Move';
  }

  private turnDirection(curr: StepInfo, next: StepInfo): 'left' | 'right' | 'straight' {
    // We approximate direction with map coordinates (%)
    // If we cannot find points => "straight"
    const pA = this.ROOMS[curr.building]?.[curr.floor]?.[curr.room];
    const pB = this.ROOMS[next.building]?.[next.floor]?.[next.room];
    if (!pA || !pB) return 'straight';

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;

    // If mostly vertical movement => straight
    if (Math.abs(dx) < 4 || Math.abs(dy) > Math.abs(dx)) return 'straight';

    return dx < 0 ? 'left' : 'right';
  }
}