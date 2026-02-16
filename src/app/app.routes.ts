import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'global',
    loadChildren: () => import('./features/game-global-map/game-global-routes')
  },
  {
    path: 'local',
    loadChildren: () => import('./features/game-local-hexagon-map/game-local-routes')
  }
];
