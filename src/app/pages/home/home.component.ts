import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DIFFICULTY_LABELS_ES, GAMES, GameDifficulty } from '../../games/games.registry';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly juegos = GAMES;

  getDifficulty(d: GameDifficulty): string {
    return DIFFICULTY_LABELS_ES[d];
  }
}
