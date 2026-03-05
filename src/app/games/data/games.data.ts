import { Game } from '../models/game.model';

export const GAMES: Game[] = [
  {
    id: 'othello',
    name: 'Othello Matemático',
    description: 'Conquista el tablero resolviendo tácticas aritméticas y volteos estratégicos en cada turno.',
    route: '/games/othello/reto/1'
  },
  {
    id: 'panda4x4',
    name: 'Panda 4x4',
    description: 'Entrena tu secuenciación lógica guiando a un panda por un laberinto combinatorio de 4x4.',
    route: '/games/panda4x4'
  },
  {
    id: 'colores',
    name: 'Colores y Proporciones',
    description: 'Equilibra colores y razones para descubrir patrones visuales ligados al razonamiento proporcional.',
    route: '/games/colores'
  }
];
