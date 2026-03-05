import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { DIFFICULTY_LABELS_ES, GameDefinition } from '../../games/games.registry';

@Component({
  selector: 'app-game-card',
  standalone: true,
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCardComponent {
  readonly game = input.required<GameDefinition>();

  constructor(private readonly router: Router) {}

  playGame(): void {
    const selectedGame = this.game();
    this.router.navigate([selectedGame.route]);
  }

  getDifficultyLabel(): string {
    return DIFFICULTY_LABELS_ES[this.game().difficulty];
  }
}
