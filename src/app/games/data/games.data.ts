import { Game } from '../models/game.model';

export const GAMES: Game[] = [
  {
    id: 'othello',
    name: 'Parcelas Matemáticas',
    description: 'Defiende tu granja resolviendo tácticas aritméticas y capturando parcelas en cada turno.',
    route: '/games/othello/reto/1'
  },
  {
    id: 'panda4x4',
    name: 'Parcelas 4x4',
    description: 'Entrena tu secuenciación lógica organizando parcelas de cultivo en un tablero 4x4.',
    route: '/games/panda4x4'
  },
  {
    id: 'colores',
    name: 'Pigmentos y Proporciones',
    description: 'Equilibra pigmentos y razones para descubrir patrones de siembra ligados al razonamiento proporcional.',
    route: '/games/colores'
  }
];
