import { OddEvenGamePage } from './app.po';

describe('odd-even-game App', () => {
  let page: OddEvenGamePage;

  beforeEach(() => {
    page = new OddEvenGamePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
