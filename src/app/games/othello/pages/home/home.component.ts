// src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBoardComponent } from '../game-board/game-board.component';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    GameBoardComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  constructor(private game: GameService) {}

  ngOnInit(): void {
    this.game.applyReto1(); // ← Aquí se asegura el tablero 4x4
  }
}
