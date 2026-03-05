export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'multi-level';

export interface GameDefinition {
  id: 'othello' | 'panda4x4' | 'colores';
  title: string;
  description: string;
  route: '/games/othello' | '/games/panda4x4' | '/games/colores';
  difficulty: GameDifficulty;
  icon: string;
}

export const GAMES: readonly GameDefinition[] = [
  {
    id: 'othello',
    title: 'Othello',
    description: 'Strategic board game with levels',
    route: '/games/othello',
    difficulty: 'medium',
    icon: '♟️'
  },
  {
    id: 'panda4x4',
    title: 'Panda 4x4',
    description: 'Logic puzzle challenge',
    route: '/games/panda4x4',
    difficulty: 'easy',
    icon: '🐼'
  },
  {
    id: 'colores',
    title: 'Color Lab',
    description: 'Color mixing math challenge',
    route: '/games/colores',
    difficulty: 'multi-level',
    icon: '🎨'
  }
] as const;
