import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { appRoutes } from './app.routes';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { AppErrorHandler } from './app-error-handler';

import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { CreateGameComponent } from './game-create/game-create.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PageNotFoundComponent} from './shared/page-not-found/page-not-found.component';
import {RouterModule} from '@angular/router';
import { GameComponent } from './game/game.component';
import { GameListComponent } from './game-list/game-list.component';
import { ErrorComponent } from './shared/error/error.component';
import { GameEnterNumberComponent } from './game-enter-number/game-enter-number.component';
import { ScoreListComponent } from './score-list/score-list.component';
import { GameChooseOddEvenComponent } from './game-choose-odd-even/game-choose-odd-even.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { HelpComponent } from './help/help.component';
import { BusyButtonComponent } from './shared/busy-button/busy-button.component';


@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    CreateGameComponent,
    PageNotFoundComponent,
    GameComponent,
    GameListComponent,
    ErrorComponent,
    GameEnterNumberComponent,
    ScoreListComponent,
    GameChooseOddEvenComponent,
    GameMenuComponent,
    HelpComponent,
    BusyButtonComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [{provide: ErrorHandler, useClass: AppErrorHandler}],
  bootstrap: [AppComponent]
})
export class AppModule { }
