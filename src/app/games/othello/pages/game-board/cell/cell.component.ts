// src/app/cell/cell.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellState } from '../../../services/game.service';


@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css'],
})
export class CellComponent {
  /** Estado de la casilla: 'empty' | 'black' | 'white' */
  @Input() state!: CellState;

  /** Emite cuando el usuario hace clic en la casilla */
  @Output() cellClick = new EventEmitter<void>();

  onClick() {
    this.cellClick.emit();
  }
}



