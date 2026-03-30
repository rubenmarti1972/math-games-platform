import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-world/world3d/world3d.component').then((m) => m.World3dComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'games',
    loadComponent: () => import('./pages/hub/hub.component').then((m) => m.HubComponent)
  },
  {
    path: 'games/othello',
    loadComponent: () =>
      import('./game-world/othello-adventure/othello-adventure.component').then((m) => m.OthelloAdventureComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./games/othello/othello.routes').then((m) => m.OTHELLO_ROUTES)
      }
    ]
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
  {
    path: 'games/hanoi',
    loadChildren: () =>
      import('./games/hanoi/hanoi.routes').then((m) => m.HANOI_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
