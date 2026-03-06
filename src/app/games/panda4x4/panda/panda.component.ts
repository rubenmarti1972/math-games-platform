import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-panda',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './panda.component.html',
  styleUrls: ['./panda.component.scss']
})
export class PandaComponent implements OnInit {

  seconds = 0;
  message = '';
  private intervalId: any;

  selectedPiece: any = null;
  selectedFromBoard: { row: number, col: number } | null = null;

  constructor(public game: GameService) {}

  ngOnInit() {
    this.intervalId = setInterval(() => this.seconds++, 1000);
  }

  stopTimer() {
    clearInterval(this.intervalId);
  }

  selectPiece(piece: any) {
    this.selectedPiece = piece;
    this.selectedFromBoard = null;
  }

  selectFromBoard(event: MouseEvent, row: number, col: number) {
    event.stopPropagation();

    const piece = this.game.board[row][col].piece;
    if (!piece) return;

    this.selectedPiece = piece;
    this.selectedFromBoard = { row, col };
  }

  placeSelected(row: number, col: number) {

    if (!this.selectedPiece) return;

    // Si la pieza venía del tablero, la quitamos temporalmente
    if (this.selectedFromBoard) {
      this.game.removePiece(
        this.selectedFromBoard.row,
        this.selectedFromBoard.col
      );
    }

    const placed = this.game.placePiece(
      this.selectedPiece,
      row,
      col
    );

    if (!placed && this.selectedFromBoard) {
      // Restaurar si no pudo colocarse
      this.game.placePiece(
        this.selectedPiece,
        this.selectedFromBoard.row,
        this.selectedFromBoard.col
      );
    }

    this.selectedPiece = null;
    this.selectedFromBoard = null;

    this.checkWin();
  }

 checkWin() {

  // Verificar si el tablero está completo
  const isFull = this.game.board.every(row =>
    row.every(cell => cell.piece !== null)
  );

  if (!isFull) {
    this.message = '';
    return;
  }

  // Si está completo, validar solución
  if (this.game.isSolved()) {
    this.stopTimer();
    this.message = `🎉 ¡Excelente cosecha! Completado en ${this.seconds}s`;
  } else {
    this.message = `❌ La cosecha no coincide, inténtalo de nuevo`;
  }
}


  restart() {
    this.game.reset();
    this.seconds = 0;
    this.message = '';
  }
}
