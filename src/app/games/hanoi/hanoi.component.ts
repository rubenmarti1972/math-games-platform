import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hanoi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hanoi.component.html',
  styleUrls: ['./hanoi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HanoiComponent implements OnInit, OnDestroy {
  readonly discOptions = [3, 4, 5, 6, 7, 8, 9, 10];
  readonly pegLabels = ['A', 'B', 'C'];

  numDiscs = signal(4);
  pegs     = signal<number[][]>([[], [], []]);
  selected = signal<number | null>(null);
  moves    = signal(0);
  solved   = signal(false);
  elapsed  = signal(0);

  readonly optimalMoves = computed(() => Math.pow(2, this.numDiscs()) - 1);

  /** One color per disc-size slot (index 0 = largest disc). */
  private readonly COLORS = [
    '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d',
    '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'
  ];

  private startTime = 0;
  private timerRef?: ReturnType<typeof setInterval>;

  ngOnInit(): void { this.init(); }

  ngOnDestroy(): void { this.stopTimer(); }

  init(): void {
    const n = this.numDiscs();
    this.pegs.set([Array.from({ length: n }, (_, i) => n - i), [], []]);
    this.selected.set(null);
    this.moves.set(0);
    this.solved.set(false);
    this.elapsed.set(0);
    this.stopTimer();
    this.startTime = Date.now();
    this.timerRef = setInterval(() => {
      this.elapsed.set(Math.floor((Date.now() - this.startTime) / 1000));
    }, 1000);
  }

  setDiscs(n: number): void {
    this.numDiscs.set(n);
    this.init();
  }

  clickPeg(pegIdx: number): void {
    if (this.solved()) return;

    const sel = this.selected();
    const pegs = this.pegs();

    if (sel === null) {
      if (pegs[pegIdx].length > 0) this.selected.set(pegIdx);
      return;
    }

    if (sel === pegIdx) {
      this.selected.set(null);
      return;
    }

    const from = pegs[sel];
    const to   = pegs[pegIdx];
    const disc = from[from.length - 1];

    if (to.length === 0 || to[to.length - 1] > disc) {
      const next = pegs.map(p => [...p]);
      next[pegIdx].push(next[sel].pop()!);
      this.pegs.set(next);
      this.moves.update(m => m + 1);
      this.selected.set(null);

      if (next[2].length === this.numDiscs()) {
        this.solved.set(true);
        this.stopTimer();
      }
    } else {
      // Invalid target — reselect if it has discs
      this.selected.set(pegs[pegIdx].length > 0 ? pegIdx : null);
    }
  }

  discColor(size: number): string {
    return this.COLORS[this.numDiscs() - size];
  }

  discWidthPct(size: number): number {
    return 18 + (size / this.numDiscs()) * 72;
  }

  formatTime(s: number): string {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }

  trackDisc(_: number, disc: number): number { return disc; }
  trackPeg(i: number): number { return i; }

  private stopTimer(): void {
    if (this.timerRef) clearInterval(this.timerRef);
  }
}
