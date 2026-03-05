import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructions.component.html',
  styleUrl: './instructions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionsComponent {
  hideInstructions: boolean = false;
  currentPage = 0;
  instructionsOne: string[] = [
    'Juego para dos personas.',
    'El juego inicia con 2 fichas verdes y 2 fichas rojas en un tablero cuadrado.',
    'Por turno, cada jugador puede realizar un movimiento.',
    'Los movimientos permitidos consisten en agregar una ficha de tal manera que encierre una fila continua de una o más fichas del color contrario. Al hacer esto las fichas que encerró se convierten en fichas de su color. '
  ];

   instructionsTwo: string[] = [
   'Al realizar un movimiento permitido no deben existir casillas libres entre ellas.',
    'El movimiento se puede realizar de forma horizontal, vertical o diagonal. ',
    'Si un jugador no puede realizar algún movimiento en su turno, deberá pasar el turno.',
    'El juego termina cuando no se puedan realizar más movimientos. ',
    'Gana el jugador que tenga más fichas de su color. ',

  ];

  toggleInstructions() {
    this.hideInstructions = !this.hideInstructions;
    if (!this.hideInstructions) {
      this.currentPage = 0;
    }
  }

  nextPage() {
    if (this.currentPage < 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
