import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Floor = 'terra' | 'primo' | 'secondo' | 'interrato' | 'rialzato';

type Point = { x: number; y: number };

type Exit = {
  id: string;
  point: Point;
};

type FullExit = Exit & {
  status: 'open' | 'blocked';
  description: string;
};

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent {

  building!: string;
  selectedFloor: Floor = 'terra';

  selectedPosition: string = '';

  nearestExit: FullExit | null = null;

  evacuationResult: {
    from: string;
    exitId: string;
    message: string;
  } | null = null;


  // =====================
  // STANZE
  // =====================

  ROOMS: Record<string, Record<string, Record<string, Point>>> = {

  A: {
    terra: {
      Biblioteca: { x: 25, y: 22 },
      'Sala Studio': { x: 62, y: 58 }
    },

    primo: {
      'Aula 3': { x: 52, y: 46 },
      'Aula 4': { x: 60, y: 50 },
      Bagno: { x: 35, y: 25 },
      Laboratorio: { x: 20, y: 20 }
    },

    secondo: {
      'Aula 7': { x: 28, y: 35 },
      'Aula 8': { x: 36, y: 38 },
      'Aula 9': { x: 55, y: 48 },
      'Aula 10': { x: 65, y: 32 }
    }
  },


  B: {

    interrato: {
      'Aula 12': { x: 30, y: 40 },
      'Aula 13': { x: 40, y: 40 },
      'Aula 14': { x: 50, y: 40 },
      'Bagno Femminile': { x: 20, y: 25 },
      'Bagno Maschile': { x: 22, y: 25 }
    },

    rialzato: {
      'Aula 17': { x: 25, y: 35 },
      'Aula 18': { x: 35, y: 35 },
      'Aula 19': { x: 45, y: 35 },
      'Aula 20': { x: 55, y: 35 },
      'Aula 21': { x: 65, y: 35 },
      'Bagno Femminile': { x: 18, y: 20 },
      'Bagno Maschile': { x: 20, y: 20 }
    },

    primo: {
      'Aula 22': { x: 30, y: 45 },
      'Aula 23': { x: 40, y: 45 },
      'Aula 24': { x: 50, y: 45 },
      'Aula 25': { x: 60, y: 45 },
      'Bagno Femminile': { x: 25, y: 28 },
      'Bagno Maschile': { x: 27, y: 28 }
    }

  },

  D: {

    terra: {

      'Aula Magna': { x: 35, y: 40 },
      'Aula Minore': { x: 70, y: 38 },
      'Portineria': { x: 45, y: 55 },
      'Bagno Femminile': { x: 50, y: 22 },
      'Bagno Maschile': { x: 27, y: 28 },
      'Ingresso Principale': { x: 48, y: 65 }

    }

  },


};






  // =====================
  // USCITE
  // =====================

  EXITS: Record<string, Record<string, FullExit[]>> = {

  // =====================
  // EDIFICIO A
  // =====================
  A: {

    terra: [
      {
        id: 'Scala Ovest',
        point: { x: 18, y: 18 },
        status: 'open',
        description: 'Vicino alla Biblioteca'
      },
      {
        id: 'Scala Est',
        point: { x: 72, y: 52 },
        status: 'blocked',
        description: 'Zona auditorium'
      }
    ],

    primo: [
      {
        id: 'Scala Ovest',
        point: { x: 15, y: 20 },
        status: 'open',
        description: 'Fine corridoio sinistro'
      },
      {
        id: 'Scala Centrale',
        point: { x: 40, y: 40 },
        status: 'open',
        description: 'Vicino ascensori'
      }
    ],

    secondo: [
      {
        id: 'Scala Ovest',
        point: { x: 18, y: 28 },
        status: 'open',
        description: 'Vicino Aula 7'
      },
      {
        id: 'Scala Est',
        point: { x: 70, y: 30 },
        status: 'open',
        description: 'Fine corridoio destro'
      }
    ]

  },


  // =====================
  // EDIFICIO B
  // =====================
  B: {

    interrato: [
      {
        id: 'Scala Nord',
        point: { x: 20, y: 25 },
        status: 'open',
        description: 'Vicino Aula 12'
      },
      {
        id: 'Scala Sud',
        point: { x: 75, y: 28 },
        status: 'open',
        description: 'Uscita verso cortile'
      }
    ],

    rialzato: [
      {
        id: 'Scala Nord',
        point: { x: 22, y: 22 },
        status: 'open',
        description: 'Vicino Aula 17'
      },
      {
        id: 'Scala Est',
        point: { x: 70, y: 35 },
        status: 'open',
        description: 'Vicino Aula 21'
      }
    ],

    primo: [
      {
        id: 'Scala Ovest',
        point: { x: 18, y: 40 },
        status: 'open',
        description: 'Vicino Aula 22'
      }
    ]

  },


  // =====================
  // EDIFICIO D
  // =====================
  D: {

    terra: [

      {
        id: 'Scala Principale',
        point: { x: 48, y: 70 },
        status: 'open',
        description: 'Ingresso principale'
      },

      {
        id: 'Scala Laterale',
        point: { x: 80, y: 30 },
        status: 'open',
        description: 'Lato Aula Minore'
      }

    ]

  }

};




  constructor(private route: ActivatedRoute) {

  this.building = this.route.snapshot.paramMap.get('building')!;

  // Imposta piano iniziale in base all'edificio
  if (this.building === 'A') {
    this.selectedFloor = 'terra';
  }

  if (this.building === 'B') {
    this.selectedFloor = 'interrato';
  }
}


  // =====================
  // CAMBIO PIANO
  // =====================

  selectFloor(floor: Floor) {

    this.selectedFloor = floor;

    this.selectedPosition = '';

    this.nearestExit = null;

    this.evacuationResult = null;
  }


  // =====================
  // DATI SELECT
  // =====================

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



  // =====================
  // CALCOLO EVACUAZIONE
  // =====================

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
    message: `Segui il corridoio verso ${nearest.id}. ${nearest.description}`
  };
}



  // =====================
  // DISTANZA
  // =====================

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
      throw new Error('Nessuna uscita disponibile');
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


  // =====================
  // ISTRUZIONI
  // =====================

  getEvacuationInstructions(): string[] {

    if (!this.selectedPosition || !this.nearestExit) return [];

    return [
      `Esci da: ${this.selectedPosition}`,
      `Vai verso: ${this.nearestExit.id}`,
      `Riferimento: ${this.nearestExit.description}`,
      'Segui la segnaletica verde',
      'Scendi le scale',
      'Raggiungi il punto di raccolta'
    ];
  }


  // =====================
  // MAPPA
  // =====================

  
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




}
