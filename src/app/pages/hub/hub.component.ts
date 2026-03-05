import { Component } from '@angular/core';
import { GameCardComponent, HubGameCard } from '../../components/game-card/game-card.component';
import { MathBackgroundComponent } from '../../components/math-background/math-background.component';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [GameCardComponent, MathBackgroundComponent],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss'
})
export class HubComponent {
  readonly games: HubGameCard[] = [
    {
      icon: '⚫',
      title: 'Othello Matemático',
      description: 'Estrategia y cálculo en cada jugada del tablero.',
      difficulty: 'Hard',
      route: '/games/othello'
    },
    {
      icon: '🐼',
      title: 'Panda 4x4',
      description: 'Resuelve patrones lógicos en una cuadrícula desafiante.',
      difficulty: 'Medium',
      route: '/games/panda4x4'
    },
    {
      icon: '🎨',
      title: 'Colores y Proporciones',
      description: 'Domina razones y proporciones con retos visuales.',
      difficulty: 'Easy',
      route: '/games/colores'
    }
  ];
}
