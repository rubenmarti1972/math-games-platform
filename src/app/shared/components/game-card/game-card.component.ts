import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../../../games/models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input({ required: true }) game!: Game;
}
