import { Component } from '@angular/core';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { GameCatalogService } from '../../core/game-catalog.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [GameCardComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent {
  readonly games = this.gameCatalogService.getGames();

  constructor(private readonly gameCatalogService: GameCatalogService) {}
}
