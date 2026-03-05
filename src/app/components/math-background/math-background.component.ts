import { Component } from '@angular/core';

@Component({
  selector: 'app-math-background',
  standalone: true,
  templateUrl: './math-background.component.html',
  styleUrl: './math-background.component.scss'
})
export class MathBackgroundComponent {
  readonly symbols = ['π', '∑', '√', '∞', 'x²', 'π', '√', '∞', '∑'];
}
