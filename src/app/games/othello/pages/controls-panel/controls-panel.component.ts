import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-controls-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './controls-panel.component.html',
  styleUrls: ['./controls-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsPanelComponent {

  maxReto = 10;

  constructor(
    private game: GameService,
    private router: Router
  ) {}

  newGame() {
    this.game.reset();
    this.router.navigate(['/games/othello/reto', 1]);
  }

  get currentReto(): number {
    const match = this.router.url.match(/\/reto\/(\d+)/);
    return match ? +match[1] : 1;
  }

  openReto(n: number) {
    this.router.navigate(['/games/othello/reto', n]);
  }

  nextReto() {
    const next = this.currentReto + 1 > this.maxReto ? 1 : this.currentReto + 1;
    this.openReto(next);
  }
}