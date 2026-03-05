import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MathSymbol {
  value: string;
  top: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

@Component({
  selector: 'app-math-background',
  standalone: true,
  templateUrl: './math-background.component.html',
  styleUrl: './math-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathBackgroundComponent {
  readonly symbols: readonly MathSymbol[] = [
    { value: 'π', top: '8%', left: '7%', duration: '16s', delay: '-5s', size: '1.8rem' },
    { value: '∑', top: '30%', left: '82%', duration: '18s', delay: '-9s', size: '2.1rem' },
    { value: '√', top: '66%', left: '12%', duration: '14s', delay: '-2s', size: '1.6rem' },
    { value: '∞', top: '72%', left: '72%', duration: '20s', delay: '-6s', size: '2rem' },
    { value: 'x²', top: '20%', left: '47%', duration: '17s', delay: '-3s', size: '1.7rem' },
    { value: 'π', top: '52%', left: '58%', duration: '22s', delay: '-12s', size: '1.5rem' },
    { value: '∑', top: '84%', left: '38%', duration: '19s', delay: '-7s', size: '1.9rem' }
  ];
}
