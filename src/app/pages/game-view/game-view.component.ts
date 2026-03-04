import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameCatalogService } from '../../core/game-catalog.service';

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.scss'
})
export class GameViewComponent {
  readonly game = this.gameCatalogService.getGameById(this.route.snapshot.paramMap.get('id') ?? '');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly gameCatalogService: GameCatalogService
  ) {}
}
