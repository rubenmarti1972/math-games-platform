import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameModeService } from './gameMode.service';

export type CellState = 'empty' | 'black' | 'white' | 'dual';
export type Player    = 'black' | 'white';

export type GameMode = 'pvp' | 'cpu';

export interface Move {
  player: Player;
  row: number;
  col: number;
}

@Injectable({
  providedIn: 'root'
})

export class GameService {
  private size = 6;
  private board: CellState[][] = [];
  private currentPlayer: Player = 'black';

  private boardSubject        = new BehaviorSubject<CellState[][]>([]);
  private blackCountSubject   = new BehaviorSubject<number>(0);
  private whiteCountSubject   = new BehaviorSubject<number>(0);
  private currentPlayerSubject= new BehaviorSubject<Player>(this.currentPlayer);
  private movesSubject        = new BehaviorSubject<Move[]>([]);

  /** Streams públicos */
  board$          : Observable<CellState[][]> = this.boardSubject.asObservable();
  blackCount$     : Observable<number>       = this.blackCountSubject.asObservable();
  whiteCount$     : Observable<number>       = this.whiteCountSubject.asObservable();
  currentPlayer$  : Observable<Player>       = this.currentPlayerSubject.asObservable();
  moves$          : Observable<Move[]>       = this.movesSubject.asObservable();

  private directions = [
    [-1, -1], [-1,  0], [-1, +1],
    [ 0, -1],           [ 0, +1],
    [+1, -1], [+1,  0], [+1, +1]
  ];

  constructor(private modeService: GameModeService) {
    //this.reset();
  }

  /** Cambia el tamaño del tablero y reinicia */
  setSize(n: number): void {
    this.size = n;
    this.reset();
  }

  /** Inicializa tablero y estados */
  reset(): void {
    // crea matriz vacía
    this.board = Array.from({ length: this.size },
      () => Array<CellState>(this.size).fill('empty'));

    // coloca las 4 fichas centrales
    const m = this.size / 2;
    this.board[m-1][m-1] = 'white';
    this.board[m][m]     = 'white';
    this.board[m-1][m]   = 'black';
    this.board[m][m-1]   = 'black';

    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }

tryMove(r: number, c: number): void {
  if (
    this.validCellsForRetoRestricto.size > 0 &&
    !this.validCellsForRetoRestricto.has(`${r},${c}`)
  ) {
    return; // Movimiento fuera del área válida
  }

  if (this.board[r][c] !== 'empty') return;

  const flips = this.getFlips(r, c, this.currentPlayer);
  if (flips.length === 0) return;

  this.board[r][c] = this.currentPlayer;

  // Solo convierte fichas que NO son duales
flips.forEach(([i, j]) => {
  if (this.board[i][j] !== 'dual') {
    this.board[i][j] = this.currentPlayer;
  }
});


  const hist = [...this.movesSubject.value, { player: this.currentPlayer, row: r, col: c }];
  this.movesSubject.next(hist);

  this.emitBoard();
  this.advanceTurn();
}

private getFlips(r: number, c: number, player: Player): [number, number][] {
  const opponent: CellState = player === 'black' ? 'white' : 'black';
  const flips: [number, number][] = [];

  for (const [dr, dc] of this.directions) {
    let i = r + dr, j = c + dc;
    const line: [number, number][] = [];

    while (this.isOnBoard(i, j)) {
      const cell = this.board[i][j];

      if (cell === 'dual') {
        // Dual se ignora, pero no se agrega al flip
        i += dr;
        j += dc;
        continue;
      }

      if (cell === opponent) {
        line.push([i, j]);
      } else {
        break; // si es vacío o propio
      }

      i += dr;
      j += dc;
    }

    if (
      line.length > 0 &&
      this.isOnBoard(i, j) &&
      this.board[i][j] === player
    ) {
      flips.push(...line);
    }
  }

  return flips;
}


  /** Comprueba límites */
  private isOnBoard(i: number, j: number): boolean {
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  }

  /** Avanza al siguiente turno, pasando si no hay movimientos */
  private advanceTurn(): void {
  const next: Player = this.currentPlayer === 'black' ? 'white' : 'black';

  if (this.hasValidMove(next)) {
    this.currentPlayer = next;
  } else if (!this.hasValidMove(this.currentPlayer)) {
    // ninguno tiene movimientos: partida termina
    return;
  }

  this.currentPlayerSubject.next(this.currentPlayer);

  // ⚠️ Ejecuta CPU después de haber actualizado el turno
  if (this.modeService.currentMode === 'cpu' && this.currentPlayer === 'white') {
    setTimeout(() => this.cpuMove(), 500);
  }
}


  /** ¿Tiene el jugador al menos un movimiento válido? */
  private hasValidMove(player: Player): boolean {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 'empty' && this.getFlips(i,j,player).length > 0) {
          return true;
        }
      }
    }
    return false;
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

  /** Emite tablero y recuenta fichas */
  private emitBoard(): void {
    // emite copia por valor
    this.boardSubject.next(this.board.map(r => [...r]));
    this.updateCounts();
  }

  /** Actualiza BehaviorSubjects de conteo */
  private updateCounts(): void {
    let b = 0, w = 0;
    for (const row of this.board) {
      for (const cell of row) {
        if (cell === 'black') b++;
        if (cell === 'white') w++;
      }
    }
    this.blackCountSubject.next(b);
    this.whiteCountSubject.next(w);
  }

/*   applyInicio(): void {
  this.size = 4;
  this.board = Array.from({ length: 4 }, () =>
    Array<CellState>(4).fill('empty')
  );

  // Puedes poner fichas iniciales o dejar vacío
  this.board[1][1] = 'white';
  this.board[2][2] = 'black';

  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
} */
  applyReto1(): void {
   this.validCellsForRetoRestricto.clear();
    this.size = 4;
    // tablero vacío 4×4
    this.board = Array.from({ length: 4 }, () => Array<CellState>(4).fill('empty'));
    // coloca verdes = 'white' en (1,2),(2,2)  -- índice base 0: [0][1],[1][1]
    this.board[1][1] = 'white';
    this.board[2][1] = 'white';
    // coloca rojas = 'black' en (1,3),(3,3) → [0][2],[2][2]
    this.board[1][2] = 'black';
    this.board[2][2] = 'black';

    // reinicia flujo de turno e historial
    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }



  applyReto2(): void {
    this.validCellsForRetoRestricto.clear();
    this.size = 6;
    // tablero vacío 4×4
    this.board = Array.from({ length: 6 }, () => Array<CellState>(6).fill('empty'));
    // coloca verdes = 'white' en (1,2),(2,2)  -- índice base 0: [0][1],[1][1]
    this.board[2][2] = 'white';
    this.board[3][2] = 'white';
    // coloca rojas = 'black' en (1,3),(3,3) → [0][2],[2][2]
    this.board[2][3] = 'black';
    this.board[3][3] = 'black';

    // reinicia flujo de turno e historial
    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }

applyReto3(): void {
  this.validCellsForRetoRestricto.clear();
  this.size = 6;
  const rows = 6;
  const cols = 4;

  // Crear un tablero vacío de 6x4
  this.board = Array.from({ length: rows }, () =>
    Array<CellState>(cols).fill('empty')
  );

  // Colocar las fichas en el centro
  // Centrales verticales serían filas 2 y 3 (índices 2 y 3)
  // Centrales horizontales serían columnas 1 y 2 (índices 1 y 2)

  // Verdes = 'white'
  this.board[2][1] = 'white'; // fila 3, col 2
  this.board[3][2] = 'white'; // fila 4, col 3

  // Rojas = 'black'
  this.board[2][2] = 'black'; // fila 3, col 3
  this.board[3][1] = 'black'; // fila 4, col 2

  // Reiniciar jugador y estados
  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
}


private validCellsForRetoRestricto: Set<string> = new Set();

applyReto4(): void {
  this.size = 6;
  const rows = 6;
  const cols = 6;

  // Crear tablero vacío 6x6
  this.board = Array.from({ length: rows }, () =>
    Array<CellState>(cols).fill('empty')
  );

  // Fichas centrales (puedes ajustar si lo necesitas)
  this.board[2][2] = 'white'; // C3
  this.board[3][3] = 'white'; // D4
  this.board[2][3] = 'black'; // D3
  this.board[3][2] = 'black'; // C4

  // Limpiar y definir celdas válidas para jugar
  this.validCellsForRetoRestricto.clear();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 2 || i === 3 || j === 2 || j === 3) {
        this.validCellsForRetoRestricto.add(`${i},${j}`);
      }
    }
  }
  // Reiniciar estado
  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
}


 applyReto5(): void {
   this.validCellsForRetoRestricto.clear();
    this.size = 4;
    // tablero vacío 4×4
    this.board = Array.from({ length: 4 }, () => Array<CellState>(4).fill('empty'));
    // coloca verdes = 'white' en (1,2),(2,2)  -- índice base 0: [0][1],[1][1]
    this.board[1][1] = 'white';
    this.board[2][2] = 'white';
    // coloca rojas = 'black' en (1,3),(3,3) → [0][2],[2][2]
    this.board[1][2] = 'black';
    this.board[2][1] = 'black';

    // reinicia flujo de turno e historial
    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }

 applyReto6(): void {
    this.validCellsForRetoRestricto.clear();
    this.size = 6;
    // tablero vacío 4×4
    this.board = Array.from({ length: 6 }, () => Array<CellState>(6).fill('empty'));
    // coloca verdes = 'white' en (1,2),(2,2)  -- índice base 0: [0][1],[1][1]
    this.board[2][2] = 'white';
    this.board[3][3] = 'white';
    // coloca rojas = 'black' en (1,3),(3,3) → [0][2],[2][2]
    this.board[2][3] = 'black';
    this.board[3][2] = 'black';

    // reinicia flujo de turno e historial
    this.currentPlayer = 'black';
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }


applyReto7(): void {
  this.validCellsForRetoRestricto.clear();
  this.size = 6;
  const rows = 6;
  const cols = 4;

  // Crear un tablero vacío de 6x4
  this.board = Array.from({ length: rows }, () =>
    Array<CellState>(cols).fill('empty')
  );

  // Colocar las fichas en el centro
  // Centrales verticales serían filas 2 y 3 (índices 2 y 3)
  // Centrales horizontales serían columnas 1 y 2 (índices 1 y 2)

  // Verdes = 'white'
  this.board[2][1] = 'white'; // fila 3, col 2
  this.board[3][2] = 'white'; // fila 4, col 3

  // Rojas = 'black'
  this.board[2][2] = 'black'; // fila 3, col 3
  this.board[3][1] = 'black'; // fila 4, col 2

  // Reiniciar jugador y estados
  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
}


applyReto8(): void {
  this.size = 6;
  const rows = 6;
  const cols = 6;

  // Crear tablero vacío 6x6
  this.board = Array.from({ length: rows }, () =>
    Array<CellState>(cols).fill('empty')
  );

  // Fichas centrales (puedes ajustar si lo necesitas)
  this.board[2][2] = 'white'; // C3
  this.board[3][3] = 'white'; // D4
  this.board[2][3] = 'black'; // D3
  this.board[3][2] = 'black'; // C4

  // Limpiar y definir celdas válidas para jugar
  this.validCellsForRetoRestricto.clear();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 2 || i === 3 || j === 2 || j === 3) {
        this.validCellsForRetoRestricto.add(`${i},${j}`);
      }
    }
  }
  // Reiniciar estado
  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
}

/* applyReto9(): void {
  const rows = 6;
  const cols = 6;
  this.size = rows;

  this.board = Array.from({ length: rows }, () =>
    Array<CellState>(cols).fill('empty')
  );

  // Coloca fichas comunes
  this.board[2][2] = 'white';
  this.board[3][3] = 'black';

  // Fichas comodín (mitad rojas mitad verdes)
  // Puedes usar un nuevo tipo por ejemplo 'dual'
  (this.board as any)[2][3] = 'dual';
  (this.board as any)[3][2] = 'dual';

  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
} */

applyReto9(): void {
  this.validCellsForRetoRestricto = new Set();

  this.size = 6;
  this.board = Array.from({ length: this.size },
    () => Array<CellState>(this.size).fill('empty'));

  // Coloca algunas fichas duales, blancas y negras para probar
  this.board[1][1] = 'dual';
  this.board[1][4] = 'dual';
  this.board[2][2] = 'white';
  this.board[2][3] = 'black';
  this.board[3][2] = 'black';
  this.board[3][3] = 'white';
  this.board[4][1] = 'dual';
  this.board[4][4] = 'dual';


  this.currentPlayer = 'black';
  this.currentPlayerSubject.next(this.currentPlayer);
  this.movesSubject.next([]);
  this.emitBoard();
}





  private emitAll() {
    this.currentPlayerSubject.next(this.currentPlayer);
    this.movesSubject.next([]);
    this.emitBoard();
  }

}
