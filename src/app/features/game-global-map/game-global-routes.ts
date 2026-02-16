import {Routes} from '@angular/router';
import {GameGlobalMap} from './game-global-map';

export default [
  {
    path: '',
    component: GameGlobalMap,
    children: []
  }
] as Routes;
