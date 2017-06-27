import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {AuthRequiredError} from './auth-required.error';
import {Router} from '@angular/router';

function errorMessageMatch(error: any, predicte: (message: string) => boolean): boolean {
  if (error.message !== undefined && typeof error.message === 'string') {
    if (predicte(error.message)) {
      return true;
    }
  }
  if (error.rejection && error.rejection.message !== undefined && typeof error.rejection.message === 'string') {
    if (predicte(error.rejection.message)) {
      return true;
    }
  }
  return false;
}

@Injectable()
export class AppErrorHandler extends ErrorHandler {

  constructor(private _injector: Injector) {
    super(null);
  }

  handleError(error: any): void {
    if (error instanceof AuthRequiredError || error.rejection instanceof AuthRequiredError) {
      const router = this._injector.get(Router);
      router.navigateByUrl('/enter-name');
    } else if (errorMessageMatch(error, (m) => m && m.startsWith('PERMISSION_DENIED'))) {
      const router = this._injector.get(Router);
      router.navigateByUrl('/error');
    } else {
      super.handleError(error);
    }
  }
}
