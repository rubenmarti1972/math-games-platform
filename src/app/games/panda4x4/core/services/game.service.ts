import { Injectable } from '@angular/core';
import { Piece } from '../models/piece.model';
import { PANDA_PIECES } from '../constants/pieces.constants';

export interface BoardCell {
  piece: Piece | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // =========================
  // ESTADO DEL JUEGO
  // =========================

  pieces: Piece[] = [];

  board: BoardCell[][] = [];

  constructor() {
    this.reset();
  }

  // =========================
  // RESET
  // =========================

  reset() {
    // Clonamos piezas
    this.pieces = PANDA_PIECES.map(p => ({ ...p }));

    // Creamos tablero vacío 4x4
    this.board = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => ({ piece: null }))
    );
  }

  // =========================
  // COLOCAR PIEZA (MODO LIBRE)
  // =========================

  placePiece(piece: Piece, row: number, col: number): boolean {

    // Si la celda ya tiene pieza, la devolvemos a la bandeja
    const existing = this.board[row][col].piece;
    if (existing) {
      this.pieces.push(existing);
    }

    // Colocamos nueva pieza
    this.board[row][col].piece = piece;

    // La quitamos de la bandeja
    this.pieces = this.pieces.filter(p => p.id !== piece.id);

    return true;
  }

  // =========================
  // REMOVER PIEZA DEL TABLERO
  // =========================

  removePiece(row: number, col: number) {

    const piece = this.board[row][col].piece;
    if (!piece) return;

    this.pieces.push(piece);
    this.board[row][col].piece = null;
  }

  // =========================
  // VALIDACIÓN FINAL
  // =========================

  isSolved(): boolean {

    // Si hay celdas vacías, no está resuelto
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!this.board[r][c].piece) return false;
      }
    }

    // Verificamos bordes
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {

        const piece = this.board[r][c].piece!;
        
        // Comparar con arriba
        if (r > 0) {
          const top = this.board[r - 1][c].piece!;
          if (!this.edgesMatch(
            this.getBottomEdge(top),
            this.getTopEdge(piece)
          )) return false;
        }

        // Comparar con izquierda
        if (c > 0) {
          const left = this.board[r][c - 1].piece!;
          if (!this.edgesMatch(
            this.getRightEdge(left),
            this.getLeftEdge(piece)
          )) return false;
        }
      }
    }

    return true;
  }

  // =========================
  // MÉTODOS AUXILIARES
  // =========================

  getTopEdge(piece: Piece) {
    return piece.matrix[0];
  }

  getBottomEdge(piece: Piece) {
    return piece.matrix[1];
  }

  getLeftEdge(piece: Piece) {
    return [piece.matrix[0][0], piece.matrix[1][0]];
  }

  getRightEdge(piece: Piece) {
    return [piece.matrix[0][1], piece.matrix[1][1]];
  }

  edgesMatch(a: string[], b: string[]) {
    return a[0] === b[0] && a[1] === b[1];
  }

}
