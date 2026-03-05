
import { Component } from '@angular/core';
import { PandaComponent } from './panda/panda.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PandaComponent],
  template: '<app-panda></app-panda>'
})
export class AppComponent {}
