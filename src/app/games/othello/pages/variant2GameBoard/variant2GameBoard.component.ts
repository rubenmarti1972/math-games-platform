import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class Variant2GameBoardComponent {

   board$ = this.game.board$;

  constructor(private game: Variant2GameService) {}

  ngOnInit(): void {
    this.game.applyReto10();
  }

  onCellClick(i: number, j: number) {
    this.game.tryMove(i, j);
  }
 }
