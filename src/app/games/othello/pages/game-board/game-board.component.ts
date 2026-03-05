// src/app/game-board/game-board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CellComponent } from './cell/cell.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [
    CommonModule,
    CellComponent
  ],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  board$ = this.gameService.board$;
  retoId: number | null = null;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    this.retoId = isNaN(id) ? null : id;

    switch (id) {
      case 1: this.gameService.applyReto1(); break;
      case 2: this.gameService.applyReto2(); break;
      case 3: this.gameService.applyReto3(); break;
      case 4: this.gameService.applyReto4(); break;
      case 5: this.gameService.applyReto5(); break;
      case 6: this.gameService.applyReto6(); break;
      case 7: this.gameService.applyReto7(); break;
      case 8: this.gameService.applyReto8(); break;
      default:
        this.gameService.reset(); // home
    }
  });
  }

  onCellClick(row: number, col: number) {
    this.gameService.tryMove(row, col);
  }


}
