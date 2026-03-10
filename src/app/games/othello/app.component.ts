import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ControlsPanelComponent } from './pages/controls-panel/controls-panel.component';
import { PlayerTurnIndicatorComponent } from './pages/player-turn-indicator/player-turn-indicator.component';
import { ScoreBoardComponent } from './pages/score-board/score-board.component';
import { GameModeService } from './services/gameMode.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ControlsPanelComponent,
    PlayerTurnIndicatorComponent,
    ScoreBoardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  mode: 'pvp' | 'cpu' = 'pvp';
  title = 'Encerrando parcelas';
  currentYear = new Date().getFullYear();

  constructor(public modeService: GameModeService) {}

  ngOnInit() {
    this.mode = this.modeService.currentMode;
  }

  setMode(mode: 'pvp' | 'cpu') {
    this.modeService.setMode(mode);
    this.mode = mode;
  }
}
