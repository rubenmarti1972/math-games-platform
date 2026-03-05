import { Routes } from '@angular/router';

// Root shell of the game (includes <router-outlet>)
import { AppComponent as OthelloShellComponent } from './app.component';

import { GameBoardComponent } from './pages/game-board/game-board.component';
import { Variant1GameBoardComponent } from './pages/variant1GameBoard/variant1GameBoard.component';
import { Variant2GameBoardComponent } from './pages/variant2GameBoard/variant2GameBoard.component';
import { InstructionsComponent } from './pages/instructions/instructions.component';

export const OTHELLO_ROUTES: Routes = [
  {
    path: '',
    component: OthelloShellComponent,
    children: [
      { path: '', component: GameBoardComponent },
      // Keeping the original routes for compatibility
      { path: 'instrucciones', component: InstructionsComponent },
      { path: 'reto/9', component: Variant1GameBoardComponent, pathMatch: 'full' },
      { path: 'reto/10', component: Variant2GameBoardComponent, pathMatch: 'full' },
      { path: 'reto/:id', component: GameBoardComponent },
      { path: 'online/:gameId', component: GameBoardComponent }
    ]
  }
];
