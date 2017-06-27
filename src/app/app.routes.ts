import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { CreateGameComponent } from './game-create/game-create.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { GameComponent } from './game/game.component';
import { GameListComponent } from './game-list/game-list.component';
import { ErrorComponent } from './shared/error/error.component';

export const appRoutes: Routes = [
  { path: 'error', component: ErrorComponent },
  { path: 'enter-name', component: SignInComponent },
  { path: 'create-game', component: CreateGameComponent },
  { path: 'game-list', component: GameListComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '',
    redirectTo: '/enter-name',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];
