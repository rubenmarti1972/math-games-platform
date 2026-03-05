import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { CellComponent } from './cell/cell.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  board$ = this.gameService.board$;
  retoId: number | null = null;

  winnerMessage = '';
  private gameStateSub?: Subscription;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.retoId = Number.isNaN(id) ? null : id;
      this.winnerMessage = '';

      switch (id) {
        case 1: this.gameService.applyReto1(); break;
        case 2: this.gameService.applyReto2(); break;
        case 3: this.gameService.applyReto3(); break;
        case 4: this.gameService.applyReto4(); break;
        case 5: this.gameService.applyReto5(); break;
        case 6: this.gameService.applyReto6(); break;
        case 7: this.gameService.applyReto7(); break;
        case 8: this.gameService.applyReto8(); break;
        default: this.gameService.reset();
      }
    });

    this.gameStateSub = this.board$.subscribe((board) => {
      const flat = board.flat();
      if (flat.includes('empty') || board.length === 0) {
        return;
      }

      const black = flat.filter((cell) => cell === 'black').length;
      const white = flat.filter((cell) => cell === 'white').length;

      this.winnerMessage = black === white
        ? 'Empate: ambos dominaron la misma cantidad de terreno.'
        : black > white
          ? 'Nox domina el mapa: encerró más territorios.'
          : 'Lira domina el mapa: encerró más territorios.';
    });
  }

  ngOnDestroy(): void {
    this.gameStateSub?.unsubscribe();
  }

  onCellClick(row: number, col: number): void {
    this.gameService.tryMove(row, col);
  }
}
