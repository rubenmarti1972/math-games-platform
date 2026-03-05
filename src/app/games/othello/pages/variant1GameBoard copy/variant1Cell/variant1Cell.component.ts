import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CellState } from '../../../services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-variant1-cell',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './variant1Cell.component.html',
  styleUrl: './variant1Cell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Variant1CellComponent {
   @Input() state!: CellState;
  @Output() cellClick = new EventEmitter<void>();

}
