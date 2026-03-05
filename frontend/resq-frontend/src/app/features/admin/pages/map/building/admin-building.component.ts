// admin-building.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

type Floor = 'terra' | 'primo' | 'secondo' | 'interrato' | 'rialzato';
type Point = { x: number; y: number };

type CorridorEdge = { fromNode: string; toNode: string; blocked: boolean };
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

interface NodeApiDto {
  label: string;        // technical id: A_T_BIBLIOTECA
  displayName: string;  // user label: Library
}

type StepInfo = { building: string; floor: Floor; nodeId: string; name: string };

@Component({
  selector: 'app-admin-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-building.component.html',
  styleUrls: ['./admin-building.component.css'],
})
export class AdminBuildingComponent implements OnInit, OnDestroy {
  building!: string;
  selectedFloor: Floor = 'terra';

  /** Selected start node = technical id (safe + unique) */
  selectedNodeId: string = '';

  //  Cached dropdown/exits lists (avoid calling functions in template)
  currentRooms: { id: string; name: string }[] = [];
  currentExits: string[] = [];

  // Live
  utentiAttivi: UserPositionDto[] = [];
  displayedEdges: CorridorEdge[] = [];

  // Path (technical node ids)
  evacuationPathNodes: string[] = [];
  evacuationPathSegmentsForCurrentFloor: PathSegment[] = [];

  // Result (display name)
  recommendedExitLabel: string | null = null;
  evacuationMessage: string = '';
  evacuationInstructions: string[] = [];

  // Nodes mapping: id -> displayName
  private nodeLabelById: Record<string, string> = {};
  private nodesLoaded = false;

  private pollingInterval: any;
  private routeSub?: Subscription;
  private lastCorridorsSignatureByBuilding: string = '';
  private hasComputedEvacuation = false;

  // =============================
  // ROOMS COORDS (coords in %)
  // =============================
  ROOMS: Record<string, Record<string, Record<string, Point>>> = {
    A: {
      terra: {
        A_T_ENTRANCE: { x: 85, y: 60 },
        A_T_HALL: { x: 50, y: 60 },
        A_T_STAIRS: { x: 15, y: 70 },
        A_T_BIBLIOTECA: { x: 25, y: 40 },
        A_T_SALA_STUDIO: { x: 60, y: 75 },

        A_T_EXIT_EAST: { x: 92, y: 62 },
        A_T_EXIT_WEST: { x: 8, y: 70 },

        A_T_EM_EXIT_BIBLIOTECA: { x: 23, y: 35 },
        A_T_EM_EXIT_SALA_STUDIO: { x: 62, y: 82 },
        A_T_EM_STAIRS_WEST: { x: 10, y: 68 },
        A_T_EM_STAIRS_EAST: { x: 90, y: 60 },
      },
      primo: {
        A_1_HALL: { x: 50, y: 60 },
        A_1_STAIRS: { x: 15, y: 70 },
        A_1_AULA_3: { x: 60, y: 75 },
        A_1_AULA_4: { x: 70, y: 75 },

        A_1_EM_STAIRS_WEST: { x: 10, y: 70 },
        A_1_EM_STAIRS_EAST: { x: 90, y: 60 },
      },
      secondo: {
        A_2_HALL: { x: 50, y: 60 },
        A_2_STAIRS: { x: 60, y: 75 },
        A_2_AULA_7: { x: 60, y: 75 },
        A_2_AULA_8: { x: 50, y: 75 },
        A_2_AULA_9: { x: 40, y: 35 },
        A_2_AULA_10: { x: 60, y: 35 },

        A_2_EM_STAIRS_WEST: { x: 10, y: 70 },
        A_2_EM_STAIRS_EAST: { x: 90, y: 35 },
      },
    },

    B: {
      interrato: {
        B_I_ENTRANCE: { x: 22, y: 30 },
        B_I_AULA_12: { x: 55, y: 50 },
        B_I_AULA_13: { x: 65, y: 50 },
        B_I_AULA_14: { x: 75, y: 50 },

        B_I_EXIT_EAST: { x: 92, y: 50 },
        B_I_EXIT_WEST: { x: 8, y: 30 },

        B_I_EM_STAIRS_WEST: { x: 12, y: 28 },
        B_I_EM_STAIRS_EAST: { x: 88, y: 48 },
      },
      rialzato: {
        B_R_ENTRANCE: { x: 22, y: 30 },
        B_R_AULA_17: { x: 45, y: 40 },
        B_R_AULA_18: { x: 55, y: 40 },
        B_R_AULA_19: { x: 65, y: 40 },
        B_R_AULA_20: { x: 85, y: 22 },
        B_R_AULA_21: { x: 85, y: 52 },

        B_R_EXIT_EAST: { x: 92, y: 40 },
        B_R_EXIT_WEST: { x: 8, y: 30 },

        B_R_EM_EXIT_AULA_20: { x: 95, y: 20 },
        B_R_EM_EXIT_AULA_21: { x: 95, y: 55 },

        B_R_EM_STAIRS_WEST: { x: 12, y: 28 },
        B_R_EM_STAIRS_EAST: { x: 88, y: 30 },
      },
      primo: {
        B_P_ENTRANCE: { x: 22, y: 30 },
        B_P_AULA_22: { x: 40, y: 40 },
        B_P_AULA_23: { x: 45, y: 40 },
        B_P_AULA_24: { x: 60, y: 40 },
        B_P_AULA_25: { x: 70, y: 40 },

        B_P_EXIT_EAST: { x: 92, y: 40 },
        B_P_EXIT_WEST: { x: 8, y: 30 },

        B_P_EM_STAIRS_WEST: { x: 12, y: 28 },
        B_P_EM_STAIRS_EAST: { x: 88, y: 40 },
      },
    },

    D: {
      terra: {
        D_T_INGRESSO_PRINCIPALE: { x: 48, y: 70 },
        D_T_PORTINERIA: { x: 45, y: 55 },
        D_T_AULA_MAGNA: { x: 35, y: 40 },
        D_T_AULA_MINORE: { x: 70, y: 38 },

        D_T_EXIT_EAST: { x: 80, y: 30 },
        D_T_EXIT_SOUTH: { x: 48, y: 70 },

        D_T_EM_EXIT_AULA_MAGNA: { x: 30, y: 45 },
        D_T_EM_EXIT_AULA_MINORE: { x: 72, y: 45 },
        D_T_EM_STAIRS: { x: 50, y: 82 },
      },
    },
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((pm) => {
      const b = pm.get('building') ?? 'A';
      this.building = b;
      this.selectedFloor = this.getDefaultFloorForBuilding(b);

      this.resetPath();
      this.selectedNodeId = '';
      this.hasComputedEvacuation = false;
      this.lastCorridorsSignatureByBuilding = '';

      this.nodesLoaded = false;
      this.currentRooms = [];
      this.currentExits = [];

      this.fetchNodes().then(() => {
        //  compute dropdown options once nodes are loaded
        this.recomputeViewLists();
        this.refreshAll();
      });
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
    if (!this.nodesLoaded) return;
    this.fetchUserLocations();
    this.fetchCorridorsLive();
  }

  // =============================
  // NODES (display names)
  // =============================
  private async fetchNodes(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<NodeApiDto[]>('/api/map/nodes').subscribe({
        next: (nodes) => {
          this.nodeLabelById = {};
          (nodes || []).forEach((n) => {
            this.nodeLabelById[n.label] = n.displayName || n.label;
          });
          this.nodesLoaded = true;
          resolve();
        },
        error: () => {
          this.nodesLoaded = true;
          resolve();
        },
      });
    });
  }

  nodeDisplayName(nodeId: string): string {
    return this.nodeLabelById[nodeId] ?? nodeId;
  }

  // =============================
  // FLOOR CHANGE
  // =============================
  selectFloor(floor: Floor) {
    this.selectedFloor = floor;

    //  recompute lists once (no template functions)
    this.recomputeViewLists();

    //  if selected room not available on this floor, reset selection
    if (this.selectedNodeId && !this.currentRooms.some((r) => r.id === this.selectedNodeId)) {
      this.selectedNodeId = '';
      this.onSelectedPositionChange('');
    }

    // refresh live
    this.fetchUserLocations();
    this.fetchCorridorsLive();

    if (this.hasComputedEvacuation && this.evacuationPathNodes.length > 1) {
      this.buildGreenSegmentsForCurrentFloor(this.evacuationPathNodes);
    } else {
      this.evacuationPathSegmentsForCurrentFloor = [];
    }
  }

  private recomputeViewLists() {
    //  build cached arrays used by template
    this.currentRooms = this.getCurrentRooms();
    this.currentExits = this.getCurrentExits();
  }

  trackByRoomId(index: number, r: { id: string; name: string }) {
    return r.id;
  }

  // =============================
  // LIVE USERS
  // =============================
  fetchUserLocations() {
    this.http.get<UserPositionDto[]>('api/user/active-locations').subscribe({
      next: (data) => {
        this.utentiAttivi = (data || []).filter((u) => this.isUserOnCurrentView(u.nodeId));
      },
      error: () => (this.utentiAttivi = []),
    });
  }

  private isUserOnCurrentView(nodeId: string): boolean {
    const parsed = this.parseNodeId(nodeId);
    if (!parsed) return false;
    return parsed.building === this.building && parsed.floor === this.selectedFloor;
  }

  getUserStyle(nodeId: string) {
    const p = this.getNodePoint(nodeId);
    if (!p) return { display: 'none' };
    return { left: p.x + '%', top: p.y + '%' };
  }

  // =============================
  // CORRIDORS LIVE
  // =============================
  fetchCorridorsLive() {
    this.http.get<CorridorApiDto[]>('/api/map/corridors').subscribe({
      next: (corridors) => {
        const allForBuilding = (corridors || []).filter(
          (c) => c.fromNode?.startsWith(this.building + '_') && c.toNode?.startsWith(this.building + '_')
        );

        const signature = allForBuilding
          .map((c) => `${c.id}:${c.blocked ? 1 : 0}`)
          .sort()
          .join('|');

        const changed = signature !== this.lastCorridorsSignatureByBuilding;
        this.lastCorridorsSignatureByBuilding = signature;

        const filtered = allForBuilding.filter((c) => this.isCorridorOnCurrentView(c.fromNode, c.toNode));

        this.displayedEdges = filtered
          .map((c) => ({
            fromNode: c.fromNode,
            toNode: c.toNode,
            blocked: c.blocked,
          }))
          .filter((e) => this.getNodePoint(e.fromNode) && this.getNodePoint(e.toNode));

        if (changed && this.hasComputedEvacuation && this.selectedNodeId) {
          this.calculateEvacuation(true);
        }
      },
      error: () => {
        this.displayedEdges = [];
      },
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
    const a = this.getNodePoint(e.fromNode);
    const b = this.getNodePoint(e.toNode);
    if (!a || !b) return 0;
    return (a.x + b.x) / 2;
  }

  midY(e: CorridorEdge): number {
    const a = this.getNodePoint(e.fromNode);
    const b = this.getNodePoint(e.toNode);
    if (!a || !b) return 0;
    return (a.y + b.y) / 2;
  }

  getBlockedCorridorsCount(): number {
    return (this.displayedEdges || []).filter((e) => e.blocked).length;
  }

  // =============================
  // POSITION SELECT
  // =============================
  getSelectedPositionStyle() {
    if (!this.selectedNodeId) return { display: 'none' };
    const p = this.getNodePoint(this.selectedNodeId);
    if (!p) return { display: 'none' };
    return { left: p.x + '%', top: p.y + '%' };
  }

  /** Nodes available on current view (building+floor) */
  private getNodesOnCurrentView(): string[] {
    const ids = Object.keys(this.nodeLabelById || {});
    return ids.filter((id) => this.isUserOnCurrentView(id));
  }

  /** Hide exits/emergency from start selection */
  private isSelectableStartNode(nodeId: string): boolean {
    const up = (nodeId || '').toUpperCase();
    if (up.includes('_EM_EXIT')) return false;
    if (up.includes('_EM_STAIRS')) return false;
    if (up.includes('_EXIT')) return false;
    return true;
  }

  /** Dropdown options */
  getCurrentRooms(): { id: string; name: string }[] {
    const nodes = this.getNodesOnCurrentView()
      .filter((id) => this.isSelectableStartNode(id))
      .map((id) => ({ id, name: this.nodeDisplayName(id) }));

    return nodes.sort((a, b) => a.name.localeCompare(b.name));
  }

  getCurrentExits(): string[] {
    const nodes = this.getNodesOnCurrentView()
      .filter((id) => {
        const up = (id || '').toUpperCase();
        return up.includes('_EXIT') || up.includes('_EM_EXIT');
      })
      .map((id) => this.nodeDisplayName(id));

    return Array.from(new Set(nodes)).sort((a, b) => a.localeCompare(b));
  }

  //  now accepts nodeId (event from ngModelChange)
  onSelectedPositionChange(_nodeId: string) {
    this.resetPath();
    this.hasComputedEvacuation = false;
  }

  private resetPath() {
    this.evacuationPathNodes = [];
    this.evacuationPathSegmentsForCurrentFloor = [];
    this.recommendedExitLabel = null;
    this.evacuationMessage = '';
    this.evacuationInstructions = [];
  }

  // =============================
  // EVACUATION API
  // =============================
  calculateEvacuation(silent = false) {
    if (!this.selectedNodeId) return;

    const url = `/api/evacuation/from/${encodeURIComponent(this.selectedNodeId)}`;

    this.http.get<{ path?: string[]; message?: string }>(url).subscribe({
      next: (res) => {
        this.hasComputedEvacuation = true;

        this.evacuationPathNodes = res.path ?? [];

        if (this.evacuationPathNodes.length > 1) {
          this.buildGreenSegmentsForCurrentFloor(this.evacuationPathNodes);
        } else {
          this.evacuationPathSegmentsForCurrentFloor = [];
        }

        const lastNode = this.evacuationPathNodes.at(-1) ?? null;
        this.recommendedExitLabel = lastNode ? this.nodeDisplayName(lastNode) : null;

        this.evacuationInstructions = this.getEvacuationInstructionsAdmin();

        if (!silent) {
          this.evacuationMessage =
            this.recommendedExitLabel
        
              ? `Follow the highlighted route to ${this.recommendedExitLabel}.`
              : 'No evacuation path available.';
        }
      },
      error: (err) => {
        console.error(err);
        this.resetPath();
        if (!silent) this.evacuationMessage = 'No evacuation path available.';
      },
    });
  }

  /** English instructions + left/right/straight */
  getEvacuationInstructionsAdmin(): string[] {
    if (!this.evacuationPathNodes || this.evacuationPathNodes.length < 2) return [];

    const steps = this.evacuationPathNodes.map((id) => this.parseNodeId(id)).filter(Boolean) as StepInfo[];
    if (steps.length < 2) return [];

    const out: string[] = [];
    const start = steps[0];

    out.push(`Start from: ${start.name}.`);
    out.push(`You are on the ${this.floorLabel(start.floor)} (Building ${start.building}).`);

    for (let i = 0; i < steps.length - 1; i++) {
      const curr = steps[i];
      const next = steps[i + 1];

      if (curr.floor !== next.floor) {
        const move = this.verticalMove(curr.floor, next.floor);
        out.push(`${move} using the stairs to reach the ${this.floorLabel(next.floor)}.`);
        continue;
      }

      const turn = this.turnDirection(curr, next);
      if (turn === 'left') out.push(`Turn left towards ${next.name}.`);
      else if (turn === 'right') out.push(`Turn right towards ${next.name}.`);
      else out.push(`Go straight towards ${next.name}.`);
    }

    const exitName = this.recommendedExitLabel ?? steps[steps.length - 1].name;
    out.push(`Reach the recommended exit: ${exitName}.`);
    out.push('Do not use elevators.');
    out.push('Once outside, go to the assembly point.');

    return out;
  }

  // =============================
  // Build green segments for CURRENT floor only
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

      const pA = this.getNodePoint(a);
      const pB = this.getNodePoint(b);
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
      },
    };
    return MAPS[this.building]?.[this.selectedFloor] ?? '';
  }

  // =============================
  // Helpers
  // =============================
  private parseNodeId(nodeId: string): StepInfo | null {
    if (!nodeId) return null;

    const parts = nodeId.split('_').filter(Boolean);
    if (parts.length < 2) return null;

    const building = parts[0];
    const floorCode = parts[1];
    const floor = this.floorCodeToFloor(floorCode);

    return {
      building,
      floor,
      nodeId,
      name: this.nodeDisplayName(nodeId),
    };
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

  private getNodePoint(nodeId: string): Point | null {
    return this.ROOMS[this.building]?.[this.selectedFloor]?.[nodeId] ?? null;
  }

  private floorLabel(f: Floor): string {
    switch (f) {
      case 'interrato':
        return 'Basement';
      case 'rialzato':
        return 'Raised Floor';
      case 'terra':
        return 'Ground Floor';
      case 'primo':
        return 'First Floor';
      case 'secondo':
        return 'Second Floor';
      default:
        return f;
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
    const pA = this.getNodePoint(curr.nodeId);
    const pB = this.getNodePoint(next.nodeId);
    if (!pA || !pB) return 'straight';

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;

    // very simple heuristic: if horizontal dominates -> left/right; else straight
    if (Math.abs(dx) < 4 || Math.abs(dy) > Math.abs(dx)) return 'straight';
    return dx < 0 ? 'left' : 'right';
  }
}