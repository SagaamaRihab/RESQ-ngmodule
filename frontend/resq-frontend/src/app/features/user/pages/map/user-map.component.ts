import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-user-map',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user-map.component.html',
  styleUrls: ['./user-map.component.css']
})
export class UserMapComponent {

  constructor(private router: Router) {}

  openBuilding(building: string) {
    this.router.navigate(['/user/map', building]);
  }

  startEvacuationFrom(node: string) {

  // salva nodo
  localStorage.setItem('startNode', node);

  // vai alla pagina evacuation
  this.router.navigate(['/user/evacuation']);

  }

}
