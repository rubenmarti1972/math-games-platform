import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { GameDefinition } from '../../games/games.registry';

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
}
