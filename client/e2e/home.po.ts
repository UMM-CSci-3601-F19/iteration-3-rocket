import {browser, element, by, promise, ElementFinder} from 'protractor';
import {Key} from 'selenium-webdriver';

export class HomePage {
  navigateTo(): promise.Promise<any> {
    return browser.get('/');
  }

  // http://www.assertselenium.com/protractor/highlight-elements-during-your-protractor-test-run/
  highlightElement(byObject) {
    function setStyle(element, style) {
      const previous = element.getAttribute('style');
      element.setAttribute('style', style);
      setTimeout(() => {
        element.setAttribute('style', previous);
      });
      return 'highlighted';
    }
    return browser.executeScript(setStyle, element(byObject).getWebElement(), 'color: red; background-color: yellow;');
  }

  getHomePanelTitle() {
    const title = element(by.id('home-rooms-card')).getText();
    this.highlightElement(by.id('home-rooms-card'));
    return title;
  }
  getUniqueRoomTitle() {
    const title = element(by.id('machines-grid')).getText();
    this.highlightElement(by.id('machines-grid'));
    return title;
  }

  getGayHallTitleInHomePanel() {
    const title = element(by.id('gayId')).getText();
    this.highlightElement(by.id('gayId'));
    return title;
  }

  getIndependenceHallTitleInHomePanel() {
    const title = element(by.id('independenceId')).getText();
    this.highlightElement(by.id('independenceId'));
    return title;
  }

  getBlakelyHallTitleInHomePanel() {
    const title = element(by.id('blakelyId')).getText();
    this.highlightElement(by.id('blakelyId'));
    return title;
  }

  getSpoonerHallTitleInHomePanel() {
    const title = element(by.id('spoonerId')).getText();
    this.highlightElement(by.id('spoonerId'));
    return title;
  }

  getGreenPrairieHallTitleInHomePanel() {
    const title = element(by.id('green_prairieId')).getText();
    this.highlightElement(by.id('green_prairieId'));
    return title;
  }

  getPineHallTitleInHomePanel() {
    const title = element(by.id('pineId')).getText();
    this.highlightElement(by.id('pineId'));
    return title;
  }

  getApartmentHallTitleInHomePanel() {
    const title = element(by.id('the_apartmentsId')).getText();
    this.highlightElement(by.id('the_apartmentsId'));
    return title;
  }

  getGayHallAvailability() {
    const availability = element(by.id('gayAvailability')).getText();
    this.highlightElement(by.id('gayAvailability'));
    return availability;
  }

  getIndependenceHallAvailability() {
    const availability = element(by.id('independenceAvailability')).getText();
    this.highlightElement(by.id('independenceAvailability'));
    return availability;
  }

  getBlakelyHallAvailability() {
    const availability = element(by.id('blakelyAvailability')).getText();
    this.highlightElement(by.id('blakelyAvailability'));
    return availability;
  }

  getSpoonerHallAvailability() {
    const availability = element(by.id('spoonerAvailability')).getText();
    this.highlightElement(by.id('spoonerAvailability'));
    return availability;
  }

  getGreenPrairieHallAvailability() {
    const availability = element(by.id('green_prairieAvailability')).getText();
    this.highlightElement(by.id('green_prairieAvailability'));
    return availability;
  }

  getPineHallAvailability() {
    const availability = element(by.id('pineAvailability')).getText();
    this.highlightElement(by.id('pineAvailability'));
    return availability;
  }

  getApartmentHallAvailability() {
    const availability = element(by.id('the_apartmentsAvailability')).getText();
    this.highlightElement(by.id('the_apartmentsAvailability'));
    return availability;
  }

  getUniqueMachine(Id: string) {
    this.highlightElement(by.id(Id));
    const title = element(by.id(Id)).getText();
    return title;
  }

  clickGayHall(){
    this.click('gayId');
  }

  getCardName() {
    const title = element(by.id('{{this.translateRoomId(machine.room_id)}}')).getText();
    this.highlightElement(by.id('{{this.translateRoomId(machine.room_id)}}'));
    return title;
  }

  getWashersTitle() {
    const title = element(by.id('home-machines-card-washer')).getText();
    this.highlightElement(by.id('home-machines-card-washer'));
    return title;
  }

  getDyersTitle() {
    const title = element(by.id('home-machines-card-dryer')).getText();
    this.highlightElement(by.id('home-machines-card-dryer'));
    return title;
  }

  getWashers() {
    return element.all(by.className('washer'));
  }

  getDryers() {
    return element.all(by.className('dryer'));
  }

  getBrokens() {
    return element.all(by.className('broken'));
  }

  clickRoomPanel(){
    this.click('home-rooms-card');
  }

  clickAllRooms(){
    this.click('allRooms');
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
