import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

interface CharacterEncounter {
  id: 'nox' | 'lira';
  name: string;
  role: string;
  challenge: string;
  orb: 'red' | 'green';
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
      id: 'nox',
      name: 'Nox',
      role: 'Orbe rojo (ataque táctico)',
      challenge: 'Cierra líneas de captura y presiona bordes sin abrir esquinas.',
      orb: 'red',
      lane: 0
    },
    {
      id: 'lira',
      name: 'Lira',
      role: 'Orbe verde (control estratégico)',
      challenge: 'Controla movilidad rival y asegura la ventaja en el cierre.',
      orb: 'green',
      lane: 1
    }
  ];

  readonly boardTiles: BoardTile[] = [
    { id: 1, label: 'Campamento', clue: 'Define si abrirás juego agresivo o de control.' },
    { id: 2, label: 'Puente táctico', clue: 'Cada jugada debe preparar la siguiente.' },
    { id: 3, label: 'Bosque espejo', clue: 'Convierte respuesta rival en oportunidad.' },
    { id: 4, label: 'Portal central', clue: 'Evita regalar estabilidad en diagonales.' },
    { id: 5, label: 'Fortín lateral', clue: 'Protege acceso a esquinas clave.' },
    { id: 6, label: 'Santuario final', clue: 'Consolida mayoría de orbes en el final.' }
  ];

  readonly discoveredIds = signal<CharacterEncounter['id'][]>([]);
  readonly journalOpen = signal(true);

  readonly discoveredCount = computed(() => this.discoveredIds().length);
  readonly progressPercent = computed(() => (this.discoveredCount() / this.encounters.length) * 100);

  readonly activeObjective = computed(() => {
    const discovered = this.discoveredIds();
    return this.encounters.find((encounter) => !discovered.includes(encounter.id))?.challenge
      ?? '¡Aventura completada! Nox y Lira dominan la isla estratégica.';
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
