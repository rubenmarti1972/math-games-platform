// src/app/pages/player-turn-indicator/player-turn-indicator.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Player } from '../../services/game.service';

@Component({
  selector: 'app-player-turn-indicator',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './player-turn-indicator.component.html',
  styleUrls: ['./player-turn-indicator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerTurnIndicatorComponent {
  currentPlayer$ = this.game.currentPlayer$;
  constructor(private game: GameService) {}
}

