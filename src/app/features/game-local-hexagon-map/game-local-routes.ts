import {Routes} from '@angular/router';
import {GameLocalHexagonMap} from './game-local-hexagon-map';

export default [
  {
    path: '',
    component: GameLocalHexagonMap,
    children: []
  }
] as Routes;
