import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { MathBackgroundComponent } from '../../shared/components/math-background/math-background.component';
import { DIFFICULTY_LABELS_ES, GAMES, GameDefinition, GameDifficulty } from '../../games/games.registry';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [GameCardComponent, MathBackgroundComponent],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubComponent {
  readonly games = signal<readonly GameDefinition[]>(GAMES);
  readonly searchText = signal('');
  readonly difficultyFilter = signal<'all' | GameDifficulty>('all');

  readonly difficultyOptions = computed(() => {
    const options = new Set<GameDifficulty>();
    this.games().forEach((game) => options.add(game.difficulty));
    return Array.from(options.values());
  });

  readonly filteredGames = computed(() => {
    const query = this.searchText().toLowerCase().trim();
    const selectedDifficulty = this.difficultyFilter();

    return this.games().filter((game) => {
      const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
      const matchesQuery =
        query.length === 0 ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query);

      return matchesDifficulty && matchesQuery;
    });
  });

  updateSearch(value: string): void {
    this.searchText.set(value);
  }

  updateDifficulty(value: string): void {
    this.difficultyFilter.set(value === 'all' ? 'all' : (value as GameDifficulty));
  }

  getDifficultyLabel(difficulty: GameDifficulty): string {
    return DIFFICULTY_LABELS_ES[difficulty];
  }
}
