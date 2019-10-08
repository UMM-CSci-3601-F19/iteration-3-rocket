import {browser, element, by, promise, ElementArrayFinder} from 'protractor';
import {Key} from 'selenium-webdriver';

export class UserPage {
  navigateTo(): promise.Promise<any> {
    return browser.get('/users');
  }

  // http://www.assertselenium.com/protractor/highlight-elements-during-your-protractor-test-run/
  highlightElement(byObject) {
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

  getUserTitle() {
    const title = element(by.id('user-list-title')).getText();
    this.highlightElement(by.id('user-list-title'));

    return title;
  }

  typeAName(name: string) {
    const input = element(by.id('userName'));
    input.click();
    input.sendKeys(name);
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

  getUsers() : ElementArrayFinder {
    return element.all(by.className('users'));
  }

  getAges() : ElementArrayFinder {
    return element.all(by.className('age-display'));
  }

  getCompanies() : ElementArrayFinder {
    return element.all(by.className('company-display'));
  }

  numUsers() : promise.Promise<number> {
    return this.getUsers().then((users) => {
      return users.length;
    });
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
