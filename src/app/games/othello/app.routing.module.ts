
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameBoardComponent } from './pages/game-board/game-board.component';
import { Variant1GameBoardComponent } from './pages/variant1GameBoard/variant1GameBoard.component';
import { Variant2GameBoardComponent } from './pages/variant2GameBoard/variant2GameBoard.component';
import { HomeComponent } from './pages/home/home.component';
import { InstructionsComponent } from './pages/instructions/instructions.component';


const routes: Routes = [
  { path: '', component: GameBoardComponent },
  { path: 'instrucciones', component: InstructionsComponent },
  { path: 'reto/9', component: Variant1GameBoardComponent, pathMatch: 'full'},
  { path: 'reto/10', component: Variant2GameBoardComponent, pathMatch: 'full'},
  { path: 'reto/:id', component: GameBoardComponent },
  { path: 'online/:gameId', component: GameBoardComponent },


  { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
