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

  constructor(private game: GameService) {}

  ngOnInit(): void {
    this.game.applyReto9();
    this.winnerMessage = '';

    this.boardSub = this.board$.subscribe((board) => {
      const flat = board.flat();
      if (board.length === 0 || flat.includes('empty')) {
        return;
      }

      const black = flat.filter((c) => c === 'black').length;
      const white = flat.filter((c) => c === 'white').length;

      this.winnerMessage = black === white
        ? 'Empate en el reto-isla: ambos conquistaron igual territorio.'
        : black > white
          ? 'Nox gana el reto-isla por mayoría de avatares.'
          : 'Lira gana el reto-isla por mayoría de avatares.';
    });
  }

  ngOnDestroy(): void {
    this.boardSub?.unsubscribe();
  }

  onCellClick(i: number, j: number) {
    this.game.tryMove(i, j);
  }
}
