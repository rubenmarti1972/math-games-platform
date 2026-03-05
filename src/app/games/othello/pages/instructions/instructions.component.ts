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
  hideInstructions: boolean = true;
  currentPage = 0;
  instructionsOne: string[] = [
    'Aventura para dos estrategas: Nox (orbe rojo) vs Lira (orbe verde).',
    'La partida inicia con 2 orbes verdes (Lira) y 2 orbes rojos (Nox) en el centro del tablero.',
    'Por turno, cada jugador puede realizar un movimiento.',
    'En cada turno colocas un orbe para encerrar una fila continua de orbes rivales. Los orbes encerrados se convierten a tu bando.'
  ];

   instructionsTwo: string[] = [
   'Al realizar un movimiento permitido no deben existir casillas libres entre ellas.',
    'El movimiento se puede realizar de forma horizontal, vertical o diagonal. ',
    'Si un jugador no puede realizar algún movimiento en su turno, deberá pasar el turno.',
    'El juego termina cuando no se puedan realizar más movimientos. ',
    'Gana quien termine con más orbes de su bando (Nox o Lira). ',

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
