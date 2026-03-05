import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

interface CharacterEncounter {
  id: 'guardian' | 'trickster' | 'oracle';
  name: string;
  role: string;
  challenge: string;
  avatar: string;
  lane: number;
}

interface BoardTile {
  id: number;
  label: string;
  clue: string;
}

@Component({
  selector: 'app-othello-adventure',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './othello-adventure.component.html',
  styleUrl: './othello-adventure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OthelloAdventureComponent {
  readonly encounters: CharacterEncounter[] = [
    {
      id: 'guardian',
      name: 'Nox, Guardián de Esquinas',
      role: 'Centinela',
      challenge: 'Protege 1 esquina del tablero para desbloquear la salida del bosque.',
      avatar: '🛡️',
      lane: 0
    },
    {
      id: 'trickster',
      name: 'Lyra, Trampera de Flancos',
      role: 'Ilusionista',
      challenge: 'Evita perder más de 2 fichas seguidas en un mismo turno de reacción.',
      avatar: '🧠',
      lane: 1
    },
    {
      id: 'oracle',
      name: 'Sigma, Oráculo Fractal',
      role: 'Estratega final',
      challenge: 'Termina con mayoría de fichas para sellar el Encierro Cromático.',
      avatar: '🔮',
      lane: 2
    }
  ];

  readonly boardTiles: BoardTile[] = [
    { id: 1, label: 'Campamento', clue: 'Analiza aperturas y no regales movilidad.' },
    { id: 2, label: 'Puente táctico', clue: 'Piensa dos jugadas adelante.' },
    { id: 3, label: 'Bosque espejo', clue: 'Forzar respuesta también es estrategia.' },
    { id: 4, label: 'Portal central', clue: 'Controla el centro sin perder bordes.' },
    { id: 5, label: 'Fortín lateral', clue: 'Evita jugadas que abran esquinas.' },
    { id: 6, label: 'Santuario final', clue: 'Consolida mayoría en cierre de partida.' }
  ];

  readonly discoveredIds = signal<CharacterEncounter['id'][]>([]);
  readonly journalOpen = signal(true);

  readonly discoveredCount = computed(() => this.discoveredIds().length);
  readonly progressPercent = computed(() => (this.discoveredCount() / this.encounters.length) * 100);

  readonly activeObjective = computed(() => {
    const discovered = this.discoveredIds();
    return this.encounters.find((encounter) => !discovered.includes(encounter.id))?.challenge
      ?? '¡Aventura completada! Ya puedes dominar la isla estratégica.';
  });

  readonly currentBoardStep = computed(() => {
    const idx = Math.min(this.discoveredCount(), this.boardTiles.length - 1);
    return this.boardTiles[idx];
  });

  toggleJournal(): void {
    this.journalOpen.update((open) => !open);
  }

  discover(id: CharacterEncounter['id']): void {
    if (this.discoveredIds().includes(id)) {
      return;
    }

    this.discoveredIds.update((ids) => [...ids, id]);
  }

  isDiscovered(id: CharacterEncounter['id']): boolean {
    return this.discoveredIds().includes(id);
  }

  avatarPosition(id: CharacterEncounter['id']): number {
    const index = this.discoveredIds().indexOf(id);
    if (index < 0) {
      return 0;
    }

    const stepWidth = 100 / (this.boardTiles.length - 1);
    return Math.min(100, (index + 1) * stepWidth);
  }
}
