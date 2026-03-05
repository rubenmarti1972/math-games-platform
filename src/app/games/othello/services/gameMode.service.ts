import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type GameMode = 'pvp' | 'cpu';

@Injectable({ providedIn: 'root' })
export class GameModeService {
  private modeSubject = new BehaviorSubject<GameMode>('pvp');
  mode$ = this.modeSubject.asObservable();

  setMode(mode: GameMode) {
    this.modeSubject.next(mode);
  }

  get currentMode(): GameMode {
    return this.modeSubject.value;
  }
}

