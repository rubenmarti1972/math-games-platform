import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface HubGameCard {
  icon: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  route: string;
}

@Component({
  selector: 'app-hub-game-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input({ required: true }) game!: HubGameCard;
}
