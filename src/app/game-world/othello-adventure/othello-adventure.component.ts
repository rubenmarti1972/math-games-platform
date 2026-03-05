import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

interface CharacterEncounter {
  id: 'guardian' | 'trickster' | 'oracle';
  name: string;
  role: string;
  challenge: string;
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
      challenge: 'Protege 1 esquina del tablero para desbloquear la salida del bosque.'
    },
    {
      id: 'trickster',
      name: 'Lyra, Trampera de Flancos',
      role: 'Ilusionista',
      challenge: 'Evita perder más de 2 fichas seguidas en un mismo turno de reacción.'
    },
    {
      id: 'oracle',
      name: 'Sigma, Oráculo Fractal',
      role: 'Estratega final',
      challenge: 'Termina con mayoría de fichas para sellar el Encierro Cromático.'
    }
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
}
