import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CellState = 'empty' | 'black' | 'white';
export type Player = 'black' | 'white';

export interface Move {
  player: Player;
  row: number;
  col: number;
}

@Injectable({ providedIn: 'root' })
export class GameOnlineService {
  private size = 6;
  private board: CellState[][] = [];
  private currentPlayer: Player = 'black';
  private movesSubject = new BehaviorSubject<Move[]>([]);
  private boardSubject = new BehaviorSubject<CellState[][]>([]);
  private currentPlayerSubject = new BehaviorSubject<Player>(this.currentPlayer);

  board$ = this.boardSubject.asObservable();
  moves$ = this.movesSubject.asObservable();
  currentPlayer$ = this.currentPlayerSubject.asObservable();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.board = Array.from({ length: this.size }, () =>
      Array<CellState>(this.size).fill('empty')
    );

    const m = this.size / 2;
    this.board[m - 1][m - 1] = 'white';
    this.board[m][m] = 'white';
    this.board[m - 1][m] = 'black';
    this.board[m][m - 1] = 'black';

    this.currentPlayer = 'black';
    this.movesSubject.next([]);
    this.emitBoard();
    this.currentPlayerSubject.next(this.currentPlayer);
  }

  tryMove(r: number, c: number): void {
    if (this.board[r][c] !== 'empty') return;

    const flips = this.getFlips(r, c, this.currentPlayer);
    if (flips.length === 0) return;

    this.board[r][c] = this.currentPlayer;
    flips.forEach(([i, j]) => (this.board[i][j] = this.currentPlayer));

    const hist = [...this.movesSubject.value, { player: this.currentPlayer, row: r, col: c }];
    this.movesSubject.next(hist);

    this.emitBoard();
    this.advanceTurn();
  }

  private getFlips(r: number, c: number, player: Player): [number, number][] {
    const opponent: CellState = player === 'black' ? 'white' : 'black';
    const directions = [
      [-1, -1], [-1, 0], [-1, +1],
      [0, -1],           [0, +1],
      [+1, -1], [+1, 0], [+1, +1]
    ];

    const flips: [number, number][] = [];

    for (const [dr, dc] of directions) {
      let i = r + dr,
        j = c + dc;
      const line: [number, number][] = [];

      while (this.isOnBoard(i, j)) {
        const cell = this.board[i][j];
        if (cell === opponent) {
          line.push([i, j]);
        } else {
          break;
        }
        i += dr;
        j += dc;
      }

      if (line.length > 0 && this.isOnBoard(i, j) && this.board[i][j] === player) {
        flips.push(...line);
      }
    }

    return flips;
  }

  private isOnBoard(i: number, j: number): boolean {
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  }

  private advanceTurn(): void {
    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
  }

  private emitBoard(): void {
    this.boardSubject.next(this.board.map(row => [...row]));
  }
}
