import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ControlsPanelComponent } from './pages/controls-panel/controls-panel.component';
import { PlayerTurnIndicatorComponent } from './pages/player-turn-indicator/player-turn-indicator.component';
import { ScoreBoardComponent } from './pages/score-board/score-board.component';
import { MoveHistoryComponent } from './pages/move-history/move-history.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { InstructionsComponent } from './pages/instructions/instructions.component';
import { GameModeService } from './services/gameMode.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ControlsPanelComponent,
    PlayerTurnIndicatorComponent,
    ScoreBoardComponent,
    MoveHistoryComponent,
    SettingsComponent,
    InstructionsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Encerrando parcelas';
  currentYear = new Date().getFullYear();

  mode: 'pvp' | 'cpu' = 'pvp';
  showModeSelector = false;
  showMoveHistory = false;

  constructor(private readonly modeService: GameModeService) {}

  ngOnInit(): void {
    this.mode = this.modeService.currentMode;
  }

  setMode(mode: 'pvp' | 'cpu'): void {
    this.modeService.setMode(mode);
    this.mode = mode;
  }

  getModeLabel(): string {
    return this.mode === 'pvp' ? 'Granja Norte vs Sur' : 'Granja vs Capataz';
  }
}
