import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription, interval } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

interface MissionMeta {
  title: string;
  objective: string;
  energy: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, RouterLink],
  template: `
    @if (!isGameRoute()) {
      <app-navbar></app-navbar>
    }

    @if (isGameRoute()) {
      <section class="game-hud">
        <div class="game-hud__left">
          <p class="label">MODO VIDEOJUEGO</p>
          <h2>{{ currentMission().title }}</h2>
          <p>{{ currentMission().objective }}</p>
        </div>

        <div class="game-hud__center">
          <div class="stat">
            <span>⏱ Tiempo</span>
            <strong>{{ elapsedTime() }}</strong>
          </div>
          <div class="stat">
            <span>🎯 Progreso de misión</span>
            <strong>{{ currentMission().energy }}%</strong>
          </div>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" [style.width.%]="progressValue()"></div>
          </div>
        </div>

        <div class="game-hud__actions">
          <a routerLink="/" class="hud-btn">Volver al mundo 3D</a>
          <a routerLink="/games" class="hud-btn hud-btn--alt">Catálogo</a>
        </div>
      </section>
    }

    <main class="app-main" [class.app-main--immersive]="isGameRoute()">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  private readonly url = signal('');
  private elapsedSeconds = signal(0);
  private timerSubscription?: Subscription;
  private routerSubscription: Subscription;

  readonly isGameRoute = computed(() => this.url().startsWith('/games/'));

  readonly currentMission = computed<MissionMeta>(() => {
    const route = this.url();

    if (route.startsWith('/games/othello')) {
      return {
        title: 'Strategy Island — Othello Arena',
        objective: 'Conquista el tablero y controla las esquinas para dominar la isla estratégica.',
        energy: 88
      };
    }

    if (route.startsWith('/games/panda4x4')) {
      return {
        title: 'Logic Island — Panda Reactor',
        objective: 'Resuelve patrones y secuencias lógicas para activar el reactor de la isla.',
        energy: 92
      };
    }

    return {
      title: 'Color Island — Chroma Lab',
      objective: 'Combina color y razonamiento para desbloquear experimentos de nivel superior.',
      energy: 85
    };
  });

  readonly elapsedTime = computed(() => {
    const sec = this.elapsedSeconds();
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  readonly progressValue = computed(() => (this.elapsedSeconds() * 1.8) % 100);

  constructor(private readonly router: Router) {
    this.url.set(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.url.set(event.urlAfterRedirects);
        this.handleTimerState();
      });

    this.handleTimerState();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  private handleTimerState(): void {
    if (this.isGameRoute()) {
      if (!this.timerSubscription) {
        this.elapsedSeconds.set(0);
        this.timerSubscription = interval(1000).subscribe(() => {
          this.elapsedSeconds.update((value) => value + 1);
        });
      }
      return;
    }

    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
  }
}
