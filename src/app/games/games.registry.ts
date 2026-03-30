export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'multi-level';

export interface GameDefinition {
  id: 'othello' | 'panda4x4' | 'colores' | 'hanoi';
  title: string;
  description: string;
  longDescription: string;
  route: '/games/othello' | '/games/panda4x4' | '/games/colores' | '/games/hanoi';
  difficulty: GameDifficulty;
  icon: string;
  color: string;
  gradient: string;
  image: string;       // ruta al SVG/imagen ilustrativa
  tags: string[];
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
    description: 'Estrategia por turnos con tablero vivo',
    longDescription: 'Conquista el tablero colocando fichas y rodeando a tu rival. Cada movimiento importa.',
    route: '/games/othello',
    difficulty: 'medium',
    icon: '♟️',
    color: '#6D28D9',
    gradient: 'linear-gradient(135deg, #2D1B69 0%, #4C1D95 60%, #6D28D9 100%)',
    image: 'assets/games/othello.svg',
    tags: ['Estrategia', 'Tablero', '2 jugadores']
  },
  {
    id: 'panda4x4',
    title: 'Panda 4×4',
    description: 'Lógica y patrones en cuadrículas',
    longDescription: 'Resuelve cuadrículas de 4×4 aplicando razonamiento lógico y reconocimiento de patrones.',
    route: '/games/panda4x4',
    difficulty: 'easy',
    icon: '🐼',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #022c22 0%, #064E3B 60%, #059669 100%)',
    image: 'assets/games/panda4x4.svg',
    tags: ['Lógica', 'Puzzles', 'Un jugador']
  },
  {
    id: 'colores',
    title: 'Lab de Colores',
    description: 'Matemáticas con mezclas de color',
    longDescription: 'Combina colores usando fracciones y proporciones para alcanzar el objetivo exacto.',
    route: '/games/colores',
    difficulty: 'multi-level',
    icon: '🎨',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #1c0a00 0%, #92400E 60%, #D97706 100%)',
    image: 'assets/games/colores.svg',
    tags: ['Fracciones', 'Visual', 'Multinivel']
  }
  ,
  {
    id: 'hanoi',
    title: 'Torres de Hanoi',
    description: 'Lógica recursiva con hasta 10 discos',
    longDescription: 'Mueve todos los discos de la torre A a la C siguiendo una regla simple: nunca un disco grande sobre uno pequeño. De 3 a 10 discos.',
    route: '/games/hanoi',
    difficulty: 'multi-level',
    icon: '🗼',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0c2a33 0%, #0e4f63 60%, #0891b2 100%)',
    image: 'assets/games/hanoi.svg',
    tags: ['Lógica', 'Recursividad', 'Un jugador']
  }
] as const;
