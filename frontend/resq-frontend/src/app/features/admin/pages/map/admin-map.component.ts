import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-admin-map',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-map.component.html',
  styleUrls: ['./admin-map.component.css']
})
export class AdminMapComponent {

  constructor(private router: Router) {}

  openBuilding(building: string) {
    this.router.navigate(['/admin/map', building]);
  }

  startEvacuationFrom(node: string) {

  // salva nodo
  localStorage.setItem('startNode', node);

  // vai alla pagina evacuation
  this.router.navigate(['/user/evacuation']);

  }

}
