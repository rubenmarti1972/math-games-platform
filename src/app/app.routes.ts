import { Routes } from '@angular/router';
import { HubComponent } from './pages/hub/hub.component';
import { GamesComponent } from './pages/games/games.component';
import { GameViewComponent } from './pages/game-view/game-view.component';

export const routes: Routes = [
  { path: '', component: HubComponent },
  { path: 'games', component: GamesComponent },
  { path: 'games/:id', component: GameViewComponent },
  { path: '**', redirectTo: '' }
];
