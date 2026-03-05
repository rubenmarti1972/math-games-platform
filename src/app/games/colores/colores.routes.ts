import { Routes } from '@angular/router';

export const COLORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/color-lab-challenge/color-lab-challenge')
        .then(m => m.ColorLabChallenge)
  }
];