import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameModeService } from './gameMode.service';

export type CellState = 'empty' | 'black' | 'white' | 'blue';
export type Player = 'black' | 'white';

export interface Move {
  player: Player;
  row: number;
  col: number;
}

@Injectable({ providedIn: 'root' })
export class Variant2GameService {
  private size = 6;
  private board: CellState[][] = [];
  private currentPlayer: Player = 'black';
  private directions = [
    [-1, -1], [-1, 0], [-1, +1],
    [ 0, -1],          [ 0, +1],
    [+1, -1], [+1, 0], [+1, +1]
  ];

  private boardSubject = new BehaviorSubject<CellState[][]>([]);
  private movesSubject = new BehaviorSubject<Move[]>([]);
  private currentPlayerSubject = new BehaviorSubject<Player>('black');
  private blackScoreSubject = new BehaviorSubject<number>(0);
  private whiteScoreSubject = new BehaviorSubject<number>(0);

  board$ = this.boardSubject.asObservable();
  moves$ = this.movesSubject.asObservable();
  currentPlayer$ = this.currentPlayerSubject.asObservable();
  blackScore$ = this.blackScoreSubject.asObservable();
  whiteScore$ = this.whiteScoreSubject.asObservable();

  constructor(private modeService: GameModeService) {
    this.applyReto10();
  }

  applyReto10(): void {
    this.board = Array.from({ length: this.size },
      () => Array<CellState>(this.size).fill('empty'));

    // Centro
    this.board[2][2] = 'white';
    this.board[3][3] = 'white';
    this.board[2][3] = 'black';
    this.board[3][2] = 'black';

    // Fichas azules
    this.board[0][1] = 'blue';
    this.board[1][5] = 'blue';
    this.board[5][2] = 'blue';

    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
    this.updateScore();
  }

  tryMove(r: number, c: number): void {
    if (this.board[r][c] !== 'empty') return;

    const flips = this.getFlips(r, c, this.currentPlayer);
    if (flips.length === 0) return;

    this.board[r][c] = this.currentPlayer;

    for (const [i, j] of flips) {
      const target = this.board[i][j];
      if (target === 'blue') {
        this.board[i][j] = this.currentPlayer;
        this.incrementScore(this.currentPlayer, 3);
      } else {
        this.board[i][j] = this.currentPlayer;
        this.incrementScore(this.currentPlayer, 1);
      }
    }

    this.movesSubject.next([...this.movesSubject.value, { player: this.currentPlayer, row: r, col: c }]);
    this.advanceTurn();
    this.emitBoard();
  }

  private getFlips(r: number, c: number, player: Player): [number, number][] {
    const opponent: CellState = player === 'black' ? 'white' : 'black';
    const flips: [number, number][] = [];

    for (const [dr, dc] of this.directions) {
      let i = r + dr, j = c + dc;
      const line: [number, number][] = [];

      while (this.isOnBoard(i, j)) {
        const cell = this.board[i][j];
        if (cell === opponent || cell === 'blue') {
          line.push([i, j]);
        } else if (cell === player) {
          if (line.length > 0) flips.push(...line);
          break;
        } else {
          break;
        }
        i += dr;
        j += dc;
      }
    }

    return flips;
  }

  private isOnBoard(i: number, j: number): boolean {
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  }

  private incrementScore(player: Player, value: number) {
    if (player === 'black') {
      this.blackScoreSubject.next(this.blackScoreSubject.value + value);
    } else {
      this.whiteScoreSubject.next(this.whiteScoreSubject.value + value);
    }
  }



  private advanceTurn(): void {
  this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
  this.currentPlayerSubject.next(this.currentPlayer);

  if (this.modeService.currentMode === 'cpu' && this.currentPlayer === 'white') {
    setTimeout(() => this.cpuMove(), 500); // pequeña pausa
  }
}

private cpuMove(): void {
  const validMoves = this.findAllValidMoves('white');
  if (validMoves.length === 0) return;
  const [r, c] = validMoves[Math.floor(Math.random() * validMoves.length)];
  this.tryMove(r, c);
}

private findAllValidMoves(player: Player): [number, number][] {
  const moves: [number, number][] = [];
  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      if (this.board[i][j] === 'empty' && this.getFlips(i, j, player).length > 0) {
        moves.push([i, j]);
      }
    }
  }
  return moves;
}

  private emitBoard(): void {
    this.boardSubject.next(this.board.map(row => [...row]));
  }

  private updateScore(): void {
    let black = 0, white = 0;
    for (let row of this.board) {
      for (let cell of row) {
        if (cell === 'black') black++;
        else if (cell === 'white') white++;
      }
    }
    this.blackScoreSubject.next(black);
    this.whiteScoreSubject.next(white);
  }
}
