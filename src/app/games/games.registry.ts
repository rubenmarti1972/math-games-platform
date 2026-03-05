export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'multi-level';

export interface GameDefinition {
  id: 'othello' | 'panda4x4' | 'colores';
  title: string;
  description: string;
  route: '/games/othello' | '/games/panda4x4' | '/games/colores';
  difficulty: GameDifficulty;
  icon: string;
}

export const DIFFICULTY_LABELS_ES: Record<GameDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
  'multi-level': 'Multinivel'
};

export const GAMES: readonly GameDefinition[] = [
  {
    id: 'othello',
    title: 'Othello',
    description: 'Juego de estrategia por turnos con niveles',
    route: '/games/othello',
    difficulty: 'medium',
    icon: '♟️'
  },
  {
    id: 'panda4x4',
    title: 'Panda 4x4',
    description: 'Desafío de lógica y resolución de patrones',
    route: '/games/panda4x4',
    difficulty: 'easy',
    icon: '🐼'
  },
  {
    id: 'colores',
    title: 'Laboratorio de Colores',
    description: 'Reto matemático de mezclas y combinaciones de color',
    route: '/games/colores',
    difficulty: 'multi-level',
    icon: '🎨'
  }
] as const;
