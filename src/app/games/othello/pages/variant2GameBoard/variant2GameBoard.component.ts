import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Variant2CellComponent } from './variant2Cell/variant2Cell.component';
import { Variant2GameService } from '../../services/variant2Game.service';

@Component({
  selector: 'app-variant2-game-board',
  standalone: true,
  imports: [CommonModule, Variant2CellComponent],
  templateUrl: './variant2GameBoard.component.html',
  styleUrl: './variant2GameBoard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Variant2GameBoardComponent implements OnDestroy {
  board$ = this.game.board$;
  winnerMessage = '';
  private boardSub?: Subscription;

  constructor(private game: Variant2GameService) {}

  ngOnInit(): void {
    this.game.applyReto10();
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
