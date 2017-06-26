import {Routes} from '@angular/router';
import {EnterNameComponent} from './enter-name/enter-name.component';
import {CreateGameComponent} from './create-game/create-game.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {GameComponent} from './game/game.component';

export const appRoutes: Routes = [
  { path: 'enter-name', component: EnterNameComponent },
  { path: 'create-game', component: CreateGameComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '',
    redirectTo: '/enter-name',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];
