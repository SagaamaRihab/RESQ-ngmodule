import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-path-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './path-viewer.component.html',
  styleUrls: ['./path-viewer.component.css']
})
export class PathViewerComponent implements OnChanges {

  @Input() path: string[] = [];

  nodes: PositionedNode[] = [];

  ngOnChanges(): void {
    this.generateLayout();
  }

  private generateLayout(): void {
    const startX = 80;
    const gap = 140;
    const y = 100;

    this.nodes = this.path.map((id, index) => ({
      id,
      x: startX + index * gap,
      y
    }));
  }

  /** Testo descrittivo automatico */
  get description(): string {
    if (!this.path || this.path.length === 0) {
      return '';
    }

    const steps = this.path.length;
    const exit = this.path[this.path.length - 1];

    return `Il percorso attraversa ${steps} nodi e conduce all’uscita ${exit}.`;
  }

  isStart(index: number): boolean {
  return index === 0;
}

isExit(index: number): boolean {
  return index === this.nodes.length - 1;
}

selectedNode: string | null = null;

selectNode(nodeId: string): void {
  this.selectedNode = nodeId;
}

getNodeDescription(nodeId: string): string {
  if (nodeId.startsWith('A')) {
    return 'Aula / area didattica';
  }
  if (nodeId.startsWith('S')) {
    return 'Scala di emergenza';
  }
  if (nodeId.startsWith('E')) {
    return 'Uscita di emergenza';
  }
  return 'Nodo generico';
}



}
