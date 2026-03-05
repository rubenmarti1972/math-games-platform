// src/app/pages/score-board/score-board.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-score-board',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreBoardComponent {
  blackCount$ = this.game.blackCount$;
  whiteCount$ = this.game.whiteCount$;
  constructor(private game: GameService) {}
}

