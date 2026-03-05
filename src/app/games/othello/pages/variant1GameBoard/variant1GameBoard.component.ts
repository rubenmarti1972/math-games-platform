import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { Variant1CellComponent } from './variant1Cell/variant1Cell.component';

@Component({
  selector: 'app-variant1-game-board',
  standalone: true,
  imports: [CommonModule, Variant1CellComponent],
  templateUrl: './variant1GameBoard.component.html',
  styleUrl: './variant1GameBoard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Variant1GameBoardComponent implements OnDestroy {
  board$ = this.game.board$;
  winnerMessage = '';
  private boardSub?: Subscription;
  readonly tileSize = 62;

  constructor(private game: GameService) {}

  ngOnInit(): void {
    this.game.applyReto9();
    this.winnerMessage = '';

    this.boardSub = this.board$.subscribe((board) => {
      const flat = board.flat();
      if (board.length === 0 || flat.includes('empty')) return;

      const black = flat.filter((c) => c === 'black').length;
      const white = flat.filter((c) => c === 'white').length;

      this.winnerMessage = black === white
        ? 'Empate: ambos dominaron la misma cantidad de terreno.'
        : black > white
          ? 'Nox domina el mapa de reto.'
          : 'Lira domina el mapa de reto.';
    });
  }

  ngOnDestroy(): void {
    this.boardSub?.unsubscribe();
  }

  onCellClick(i: number, j: number): void {
    this.game.tryMove(i, j);
  }

  getTileStyle(row: number, col: number): Record<string, string> {
    const size = this.tileSize;
    const stagger = row % 2 === 0 ? 0 : size * 0.46;
    const jitterX = ((row * 11 + col * 7) % 5) - 2;
    const jitterY = ((row * 5 + col * 3) % 5) - 2;
    const left = col * (size * 0.92) + stagger + jitterX;
    const top = row * (size * 0.78) + jitterY;

    return { left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px` };
  }

  boardWidth(rows: number, cols: number): string {
    const size = this.tileSize;
    return `${Math.ceil(cols * (size * 0.92) + size * 1.55)}px`;
  }

  boardHeight(rows: number, cols: number): string {
    const size = this.tileSize;
    return `${Math.ceil(rows * (size * 0.78) + size * 1.2)}px`;
  }
}
