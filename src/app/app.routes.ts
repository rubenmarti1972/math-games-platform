import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GamesComponent } from './pages/games/games.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games', component: GamesComponent },

  {
    path: 'games/othello',
    loadChildren: () =>
      import('./games/othello/othello.routes').then((m) => m.OTHELLO_ROUTES)
  },
  {
    path: 'games/panda4x4',
    loadChildren: () =>
      import('./games/panda4x4/panda4x4.routes').then((m) => m.PANDA4X4_ROUTES)
  },
  {
    path: 'games/colores',
    loadChildren: () =>
      import('./games/colores/colores.routes').then((m) => m.COLORES_ROUTES)
  },

  { path: '**', redirectTo: '' }
];
