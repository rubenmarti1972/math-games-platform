import { Variant2GameBoardComponent } from './../variant2GameBoard.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CellState } from '../../../services/variant2Game.service';

@Component({
  selector: 'app-variant2-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variant2Cell.component.html',
  styleUrl: './variant2Cell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Variant2CellComponent {
   @Input() state!: CellState;
    @Output() cellClick = new EventEmitter<void>();
}
