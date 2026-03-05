import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  gameId: string = '';

  constructor(private router: Router) {}

  createGame() {
    const newGameId = Math.random().toString(36).substring(2, 8);
    this.router.navigate(['/online', newGameId]);
  }

  joinGame() {
    if (this.gameId.trim()) {
      this.router.navigate(['/online', this.gameId.trim()]);
    }
  }
}

