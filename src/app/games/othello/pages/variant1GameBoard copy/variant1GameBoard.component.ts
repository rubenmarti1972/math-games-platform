import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Variant1CellComponent } from './variant1Cell/variant1Cell.component';

@Component({
  selector: 'app-variant1-game-board',
  standalone: true,
   imports: [
      CommonModule,
      Variant1CellComponent
    ],
  templateUrl: './variant1GameBoard.component.html',
  styleUrl: './variant1GameBoard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Variant1GameBoardComponent {
   board$ = this.game.board$;

  constructor(private game: GameService) {}

  ngOnInit(): void {
    this.game.applyReto9();
  }

  onCellClick(i: number, j: number) {
    this.game.tryMove(i, j);
    console.log(`Click en celda: ${i}, ${j}`);
  }
 }


