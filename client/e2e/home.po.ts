import {browser, element, by, promise, ElementFinder} from 'protractor';
import {Key} from 'selenium-webdriver';
export class HomePage {
  navigateTo(): promise.Promise<any> {
    return browser.get('/', 1500);
  }
  // http://www.assertselenium.com/protractor/highlight-elements-during-your-protractor-test-run/
  highlightElement(byObject) {
    // tslint:disable-next-line:no-shadowed-variable
    function setStyle(element, style) {
      const previous = element.getAttribute('style');
      element.setAttribute('style', style);
      setTimeout(() => {
        element.setAttribute('style', previous);
      }, 200);
      return 'highlighted';
    }
    return browser.executeScript(setStyle, element(byObject).getWebElement(), 'color: red; background-color: yellow;');
  }
  getHomePanelTitle() {
    const title = element(by.id('home-rooms-card')).getText();
    console.log('po1');
    this.highlightElement(by.id('home-rooms-card'));
    console.log('po2');
    // console.log(title);
    return title;
  }
  getGayHallTitleInHomePanel() {
    const title = element(by.id('gay')).getText();
    this.highlightElement(by.id('gay'));
    return title;
  }
  getIndependenceHallTitleInHomePanel() {
    const title = element(by.id('independence')).getText();
    this.highlightElement(by.id('independence'));
    return title;
  }
  getBlakelyHallTitleInHomePanel() {
    const title = element(by.id('blakely')).getText();
    this.highlightElement(by.id('blakely'));
    return title;
  }
  getSpoonerHallTitleInHomePanel() {
    const title = element(by.id('spooner')).getText();
    this.highlightElement(by.id('spooner'));
    return title;
  }
  getGreenPrairieHallTitleInHomePanel() {
    const title = element(by.id('green_prairie')).getText();
    this.highlightElement(by.id('green_prairie'));
    return title;
  }
  getPineHallTitleInHomePanel() {
    const title = element(by.id('pine')).getText();
    this.highlightElement(by.id('pine'));
    return title;
  }
  getApartmentHallTitleInHomePanel() {
    const title = element(by.id('the_apartments')).getText();
    this.highlightElement(by.id('the_apartments'));
    return title;
  }
  getGayHallAvailability() {
    const availability = element(by.id('gayavailability')).getText();
    this.highlightElement(by.id('gayavailability'));
    return availability;
  }
  getCorrectNumberOfAvailableMachinesInGayHall() {
  }
  selectUpKey() {
    browser.actions().sendKeys(Key.ARROW_UP).perform();
  }
  backspace() {
    browser.actions().sendKeys(Key.BACK_SPACE).perform();
  }
  getCompany(company: string) {
    const input = element(by.id('userCompany'));
    input.click();
    input.sendKeys(company);
    this.click('submit');
  }
  getUserByAge() {
    const input = element(by.id('userName'));
    input.click();
    input.sendKeys(Key.TAB);
  }
  getUniqueUser(email: string) {
    const user = element(by.id(email)).getText();
    this.highlightElement(by.id(email));
    return user;
  }
  getUsers() {
    return element.all(by.className('users'));
  }
  elementExistsWithId(idOfElement: string): promise.Promise<boolean> {
    if (element(by.id(idOfElement)).isPresent()) {
      this.highlightElement(by.id(idOfElement));
    }
    return element(by.id(idOfElement)).isPresent();
  }
  elementExistsWithCss(cssOfElement: string): promise.Promise<boolean> {
    return element(by.css(cssOfElement)).isPresent();
  }
  click(idOfButton: string): promise.Promise<void> {
    this.highlightElement(by.id(idOfButton));
    return element(by.id(idOfButton)).click();
  }
  field(idOfField: string) {
    return element(by.id(idOfField));
  }
  button(idOfButton: string) {
    this.highlightElement(by.id(idOfButton));
    return element(by.id(idOfButton));
  }
  getTextFromField(idOfField: string) {
    this.highlightElement(by.id(idOfField));
    return element(by.id(idOfField)).getText();
  }
}
