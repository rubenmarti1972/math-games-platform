
import { Piece } from './piece.model';

export interface BoardCell {
  piece: Piece | null;
}

export type Board = BoardCell[][];
