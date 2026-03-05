// src/app/pages/settings/settings.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  boardSizes = [4, 6, 8];
  selectedSize = 4;
  constructor(private game: GameService) {}
  apply() { this.game.setSize(Number(this.selectedSize)); }
}

