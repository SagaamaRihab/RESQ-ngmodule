// ================= IMPORT =================

// Component Angular
import { Component } from '@angular/core';

// Per leggere parametri dalla rotta (es: /map/A)
import { ActivatedRoute } from '@angular/router';

// Moduli comuni
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// ================= TYPE DEFINITIONS =================

// Tipi di piano disponibili
type Floor =
  | 'ground'
  | 'first'
  | 'second'
  | 'basement'
  | 'mezzanine';

// Punto sulla mappa
type Point = {
  x: number;
  y: number;
};

// Uscita base
type Exit = {
  id: string;
  point: Point;
};

// Uscita completa con stato
type FullExit = Exit & {
  status: 'open' | 'blocked';
  description: string;
};


// ================= COMPONENT =================

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})

export class BuildingComponent {


  // =================================================
  // ============ STATO PRINCIPALE ===================
  // =================================================

  building!: string;

  // Piano selezionato
  selectedFloor: Floor = 'ground';

  // Stanza selezionata
  selectedPosition: string = '';

  // Uscita più vicina
  nearestExit: FullExit | null = null;

  // Risultato evacuazione
  evacuationResult: {
    from: string;
    exitId: string;
    message: string;
  } | null = null;


  // =================================================
  // ============ STANZE =============================
  // =================================================

  ROOMS: Record<string, Record<string, Record<string, Point>>> = {

    // ========== BUILDING A ==========
    A: {

      ground: {
        Library: { x: 25, y: 22 },
        'Study Room': { x: 62, y: 58 }
      },

      first: {
        'Room 3': { x: 52, y: 46 },
        'Room 4': { x: 60, y: 50 },
        Bathroom: { x: 35, y: 25 },
        Laboratory: { x: 20, y: 20 }
      },

      second: {
        'Room 7': { x: 28, y: 35 },
        'Room 8': { x: 36, y: 38 },
        'Room 9': { x: 55, y: 48 },
        'Room 10': { x: 65, y: 32 }
      }
    },


    // ========== BUILDING B ==========
    B: {

      basement: {
        'Room 12': { x: 30, y: 40 },
        'Room 13': { x: 40, y: 40 },
        'Room 14': { x: 50, y: 40 },
        'Women Bathroom': { x: 20, y: 25 },
        'Men Bathroom': { x: 22, y: 25 }
      },

      mezzanine: {
        'Room 17': { x: 25, y: 35 },
        'Room 18': { x: 35, y: 35 },
        'Room 19': { x: 45, y: 35 },
        'Room 20': { x: 55, y: 35 },
        'Room 21': { x: 65, y: 35 },
        'Women Bathroom': { x: 18, y: 20 },
        'Men Bathroom': { x: 20, y: 20 }
      },

      first: {
        'Room 22': { x: 30, y: 45 },
        'Room 23': { x: 40, y: 45 },
        'Room 24': { x: 50, y: 45 },
        'Room 25': { x: 60, y: 45 },
        'Women Bathroom': { x: 25, y: 28 },
        'Men Bathroom': { x: 27, y: 28 }
      }

    },


    // ========== BUILDING D ==========
    D: {

      ground: {

        'Main Hall': { x: 35, y: 40 },
        'Secondary Hall': { x: 70, y: 38 },
        Reception: { x: 45, y: 55 },
        'Women Bathroom': { x: 50, y: 22 },
        'Men Bathroom': { x: 27, y: 28 },
        'Main Entrance': { x: 48, y: 65 }

      }

    }

  };


  // =================================================
  // ============ USCITE =============================
  // =================================================

  EXITS: Record<string, Record<string, FullExit[]>> = {


    // ========== BUILDING A ==========
    A: {

      ground: [
        {
          id: 'West Staircase',
          point: { x: 18, y: 18 },
          status: 'open',
          description: 'Near the Library'
        },
        {
          id: 'East Staircase',
          point: { x: 72, y: 52 },
          status: 'blocked',
          description: 'Auditorium area'
        }
      ],

      first: [
        {
          id: 'West Staircase',
          point: { x: 15, y: 20 },
          status: 'open',
          description: 'End of left corridor'
        },
        {
          id: 'Central Staircase',
          point: { x: 40, y: 40 },
          status: 'open',
          description: 'Near elevators'
        }
      ],

      second: [
        {
          id: 'West Staircase',
          point: { x: 18, y: 28 },
          status: 'open',
          description: 'Near Room 7'
        },
        {
          id: 'East Staircase',
          point: { x: 70, y: 30 },
          status: 'open',
          description: 'End of right corridor'
        }
      ]

    },


    // ========== BUILDING B ==========
    B: {

      basement: [
        {
          id: 'North Staircase',
          point: { x: 20, y: 25 },
          status: 'open',
          description: 'Near Room 12'
        },
        {
          id: 'South Staircase',
          point: { x: 75, y: 28 },
          status: 'open',
          description: 'Exit to courtyard'
        }
      ],

      mezzanine: [
        {
          id: 'North Staircase',
          point: { x: 22, y: 22 },
          status: 'open',
          description: 'Near Room 17'
        },
        {
          id: 'East Staircase',
          point: { x: 70, y: 35 },
          status: 'open',
          description: 'Near Room 21'
        }
      ],

      first: [
        {
          id: 'West Staircase',
          point: { x: 18, y: 40 },
          status: 'open',
          description: 'Near Room 22'
        }
      ]

    },


    // ========== BUILDING D ==========
    D: {

      ground: [

        {
          id: 'Main Staircase',
          point: { x: 48, y: 70 },
          status: 'open',
          description: 'Main entrance'
        },

        {
          id: 'Side Staircase',
          point: { x: 80, y: 30 },
          status: 'open',
          description: 'Secondary hall side'
        }

      ]

    }

  };


  // =================================================
  // ============ COSTRUTTORE ========================
  // =================================================

  constructor(private route: ActivatedRoute) {

    // Legge edificio dall'URL
    this.building = this.route.snapshot.paramMap.get('building')!;


    // Imposta piano iniziale
    if (this.building === 'A') {
      this.selectedFloor = 'ground';
    }

    if (this.building === 'B') {
      this.selectedFloor = 'basement';
    }
  }


  // =================================================
  // ============ CAMBIO PIANO =======================
  // =================================================

  selectFloor(floor: Floor) {

    this.selectedFloor = floor;

    // Reset selezioni
    this.selectedPosition = '';
    this.nearestExit = null;
    this.evacuationResult = null;
  }


  // =================================================
  // ============ DATI SELECT ========================
  // =================================================

  getCurrentRooms(): string[] {

    const buildingRooms = this.ROOMS[this.building];
    if (!buildingRooms) return [];

    const floorRooms = buildingRooms[this.selectedFloor];
    if (!floorRooms) return [];

    return Object.keys(floorRooms);
  }


  getCurrentExits(): string[] {

    return this.EXITS[this.building]?.[this.selectedFloor]
      ?.map(e => e.id) || [];
  }


  // =================================================
  // ============ CALCOLO EVACUAZIONE =================
  // =================================================

  calculateEvacuation() {

    if (!this.selectedPosition) return;

    const buildingRooms = this.ROOMS[this.building];
    if (!buildingRooms) return;

    const floorRooms = buildingRooms[this.selectedFloor];
    if (!floorRooms) return;

    const start = floorRooms[this.selectedPosition];
    if (!start) return;


    const nearest = this.findNearestExit(start);

    this.nearestExit = nearest;


    this.evacuationResult = {
      from: this.selectedPosition,
      exitId: nearest.id,
      message: `Follow the corridor toward ${nearest.id}. ${nearest.description}`
    };
  }


  // =================================================
  // ============ DISTANZA ===========================
  // =================================================

  private distance(a: Point, b: Point): number {

    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
    );
  }


  private findNearestExit(start: Point): FullExit {

    const exits =
      this.EXITS[this.building][this.selectedFloor]
        .filter(e => e.status === 'open');


    if (!exits.length) {
      throw new Error('No exits available');
    }


    let nearest = exits[0];
    let min = this.distance(start, nearest.point);


    for (const e of exits) {

      const d = this.distance(start, e.point);

      if (d < min) {
        min = d;
        nearest = e;
      }
    }

    return nearest;
  }


  // =================================================
  // ============ ISTRUZIONI =========================
  // =================================================

  getEvacuationInstructions(): string[] {

    if (!this.selectedPosition || !this.nearestExit) return [];


    return [
      `Exit from: ${this.selectedPosition}`,
      `Go toward: ${this.nearestExit.id}`,
      `Reference point: ${this.nearestExit.description}`,
      'Follow the green signs',
      'Go down the stairs',
      'Reach the meeting point'
    ];
  }


  // =================================================
  // ============ MAPPA ==============================
  // =================================================

  get floorImage(): string {

    const MAPS: Record<string, Record<string, string>> = {

      A: {
        ground: '/assets/maps/A/piano-terra.png',
        first: '/assets/maps/A/primo-piano.png',
        second: '/assets/maps/A/secondo-piano.png',
      },

      B: {
        basement: '/assets/maps/B/Piano-interrato.png',
        mezzanine: '/assets/maps/B/Piano-Rialzato.png',
        first: '/assets/maps/B/Primo-piano (2).png',
      },

      D: {
        ground: '/assets/maps/D/Edificio-D.png',
      }

    };


    return MAPS[this.building]?.[this.selectedFloor] ?? '';
  }

}
