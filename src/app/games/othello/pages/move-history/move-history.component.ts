// src/app/pages/move-history/move-history.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Move } from '../../services/game.service';

@Component({
  selector: 'app-move-history',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './move-history.component.html',
  styleUrls: ['./move-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveHistoryComponent {
  moves$ = this.game.moves$;
  constructor(private game: GameService) {}
}

