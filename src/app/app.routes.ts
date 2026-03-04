import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GamesComponent } from './pages/games/games.component';
import { GameViewComponent } from './pages/game-view/game-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games', component: GamesComponent },
  { path: 'games/:id', component: GameViewComponent },
  { path: '**', redirectTo: '' }
];
