export class AuthRequiredError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, AuthRequiredError.prototype);
  }
}
