import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvacuationService } from '../../../../core/services/evacuation.service';

@Component({
  selector: 'app-evacuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evacuation.component.html',
  styleUrls: ['./evacuation.component.css'],

  
})
export class EvacuationComponent {

  selectedBuilding: string = '';
  selectedFloor: string = '';
  selectedNodeId: string = '';

  availableFloors: string[] = [];
  filteredNodes: any[] = [];
  roomsLoaded: boolean = false;

  error: string | null = null;

  constructor(
    private evacuationService: EvacuationService,
    private router: Router
  ) {}

  // =============================
  // FLOORS CONFIG
  // =============================

  buildingFloors: any = {
    A: ['Ground Floor', 'First Floor', 'Second Floor'],
    B: ['Basement', 'Raised Floor', 'First Floor'],
    D: ['Ground Floor']
  };

  floorCodeMap: any = {
  A: {
    'Ground Floor': 'GROUND',
    'First Floor': 'FIRST',
    'Second Floor': 'SECOND'
  },
  B: {
    'Basement': 'BASEMENT',
    'Raised Floor': 'RAISED',
    'First Floor': 'FIRST'
  },
  D: {
    'Ground Floor': 'GROUND'
  }
};

  // =============================
  // BUILDING CHANGE
  // =============================

  onBuildingChange() {

    this.availableFloors =
      this.buildingFloors[this.selectedBuilding] || [];

    this.selectedFloor = '';
    this.selectedNodeId = '';
    this.filteredNodes = [];
    this.error = null;
  }

  // =============================
  // FLOOR CHANGE
  // =============================

 onFloorChange() {

  console.log("Building:", this.selectedBuilding);
  console.log("Floor:", this.selectedFloor);

  this.selectedNodeId = '';
  this.filteredNodes = [];

  if (!this.selectedFloor) return;

  const floorCode =
    this.floorCodeMap[this.selectedBuilding][this.selectedFloor];

  console.log("Floor code sent to backend:", floorCode);

  this.evacuationService
    .getNodes(this.selectedBuilding, floorCode)
    .subscribe(nodes => {

      console.log("Nodes from backend:", nodes);

      this.filteredNodes = nodes;
    });
}


roomDropdownOpen = false;

toggleRoomDropdown() {
  this.roomDropdownOpen = !this.roomDropdownOpen;
}

selectRoom(node: any, event: Event) {
  event.stopPropagation();
  this.selectedNodeId = node.label;
  this.roomDropdownOpen = false;
}

getSelectedRoomName(): string {
  const room = this.filteredNodes.find(
    r => r.label === this.selectedNodeId
  );
  return room ? room.displayName : '';
}
  // =============================
  // CALCULATE
  // =============================

  calculate(): void {

    if (!this.selectedBuilding || !this.selectedNodeId) {
      this.error = 'Please complete all selections';
      return;
    }

    this.router.navigate(
      [`/user/map/${this.selectedBuilding}`],
      { queryParams: { start: this.selectedNodeId } }
    );
  }

}