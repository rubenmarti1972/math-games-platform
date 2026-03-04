import { Injectable } from '@angular/core';
import { GAMES } from '../games/data/games.data';
import { Game } from '../games/models/game.model';

@Injectable({ providedIn: 'root' })
export class GameCatalogService {
  getGames(): Game[] {
    return GAMES;
  }

  getGameById(id: string): Game | undefined {
    return GAMES.find((game) => game.id === id);
  }
}
