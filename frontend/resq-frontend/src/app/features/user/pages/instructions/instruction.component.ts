import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent {

  instructions = [
    {
      title: 'Mantieni la calma',
      description: 'Evita il panico e segui le indicazioni fornite dal sistema RESQ.'
    },
    {
      title: 'Segui i percorsi di evacuazione',
      description: 'Utilizza solo le uscite segnalate e non usare ascensori.'
    },
    {
      title: 'Aiuta chi è in difficoltà',
      description: 'Se possibile, presta assistenza a persone con mobilità ridotta.'
    },
    {
      title: 'Raggiungi il punto di raccolta',
      description: 'Allontanati dall’edificio e attendi istruzioni dalle autorità.'
    }
  ];

}
