import {HomePage} from './home.po';
import {browser, by, element, protractor} from 'protractor';
import {Key} from 'selenium-webdriver';
import {CookieService} from "ngx-cookie-service";
import {findAll} from "@angular/compiler-cli/ngcc/src/utils";

// This line (combined with the function that follows) is here for us
// to be able to see what happens (part of slowing things down)
// https://hassantariqblog.wordpress.com/2015/11/09/reduce-speed-of-angular-e2e-protractor-tests/

const origFn = browser.driver.controlFlow().execute;

browser.driver.controlFlow().execute = function () {
  const args = arguments;

  // queue 100ms wait between test
  // This delay is only put here so that you can watch the browser do xits thing.
  // If you're tired of xit taking long you can remove this call or change the delay
  // to something smaller (even 0).
  origFn.call(browser.driver.controlFlow(), () => {
    return protractor.promise.delayed(0);
  });

  return origFn.apply(browser.driver.controlFlow(), args);
};


describe('home', () => {
  let page: HomePage;
  let cookieService: CookieService;

  beforeEach(() => {
    page = new HomePage();
    // cookieService = new CookieService(page, );
  });

  afterEach(() => {
    // browser.executeScript('window.sessionStorage.clear();');
    // browser.executeScript('window.localStorage.clear();');
    browser.manage().deleteAllCookies();
    // cookieService.deleteAll()
  });

  it('should get and highlight Home panel title attribute', () => {
    page.navigateTo();
    expect(page.getHomePanelTitle()).toEqual('Select a Laundry Room to View');
  });

  it('should get and highlight each hall title attribute', () => {
    page.navigateTo();
    expect(page.getGayHallTitleInHomePanel()).toEqual('Gay Hall');
    expect(page.getIndependenceHallTitleInHomePanel()).toEqual('Independence Hall');
    expect(page.getBlakelyHallTitleInHomePanel()).toEqual('Blakely Hall');
    expect(page.getSpoonerHallTitleInHomePanel()).toEqual('Spooner Hall');
    expect(page.getGreenPrairieHallTitleInHomePanel()).toEqual('Green Prairie Hall');
    expect(page.getPineHallTitleInHomePanel()).toEqual('Pine Hall');
    expect(page.getApartmentHallTitleInHomePanel()).toEqual('The Apartments');
  });

  it('should get and highlight each hall availability attribute', () => {
    page.navigateTo();
    expect(page.getGayHallAvailability()).toEqual('2 / 9 vacant');
    expect(page.getIndependenceHallAvailability()).toEqual('5 / 15 vacant');
    expect(page.getBlakelyHallAvailability()).toEqual('5 / 11 vacant');
    expect(page.getSpoonerHallAvailability()).toEqual('0 / 6 vacant');
    expect(page.getGreenPrairieHallAvailability()).toEqual('3 / 7 vacant');
    expect(page.getPineHallAvailability()).toEqual('2 / 5 vacant');
    expect(page.getApartmentHallAvailability()).toEqual('1 / 5 vacant');
  });

  it('should display a graph when a room is selected', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.elementExistsWithCss('predictionGraphTitle'));
  });

  it('should display a map when a room is selected', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.getEntrance()).toEqual('Entrance of Gay Hall');
  });

  it('should open a dialog for corresponding machine', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.elementExistsWithId('dorky-gamboge-dog'));
    page.click('dorky-gamboge-dog');
    expect(page.getDialogTitle()).toEqual('Machine Information');
  });

  it('should get and have correct title for gay\'s washers and dryers panel', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.getUniqueRoomTitle()).toEqual('Machines within Gay Hall');
  });

  it('should get and have specific machines', () => {
    page.navigateTo();
    expect(page.getUniqueMachine('69dacaa9-ee11-11e9-8256-56000218142a')).toContain('Flaky Red Buffalo');
    expect(page.getUniqueMachine('69dacaa6-ee11-11e9-8256-56000218142a')).toContain('Dorky Gamboge Dog');
  });

  it('should get and have correct number of gay\'s washers', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getWashers().then((washers) => {
      expect(washers.length).toBe(2);
    });
  });

  it('should get and have correct number of gay\'s dryers', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getDryers().then((dryers) => {
      expect(dryers.length).toBe(7);
    });
  });

  it('should get and have correct number of gay\'s broken machines', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getBrokens().then((brokens) => {
      expect(brokens.length).toBe(0);
    });
  });

  it('should get and have correct number of washers and dryers in total when click All Rooms', () => {
    page.navigateTo();
    page.clickGayHall();
    page.clickRoomPanel();
    page.clickAllRooms();
    page.getWashers().then((washers) => {
      expect(washers.length).toBe(28);
    });
    page.getDryers().then((dryers) => {
      expect(dryers.length).toBe(32);
    });
  });

  it('should open a report page', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.click('reportId'));
  });

  xit('should change time left in panel title', () => {
    page.navigateTo();
    const a = page.getUniqueMachine('69dacaa7-ee11-11e9-8256-56000218142a');
    browser.sleep(60000);
    page.navigateTo();
    const b = page.getUniqueMachine('69dacaa7-ee11-11e9-8256-56000218142a');
    expect(a).not.toEqual(b);
  }, 100000);

  it('should have a make default button when you select a specific room', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.elementExistsWithId('defaultRoomButton'));
  });

  it('should have an unset default button when you set a room to be default', () => {
    page.navigateTo();
    page.clickGayHall();
    page.click('defaultRoomButton');
    expect(page.elementExistsWithId('unsetDefaultRoomButton'));
    // page.click('unsetDefaultRoomButton');
  });

  it('should set gay hall as default room', () => {
    page.navigateTo();
    page.clickGayHall();
    page.click('defaultRoomButton');
    page.navigateTo();
    expect(page.getRoomTitle()).toEqual('Gay Hall');
    // page.click('unsetDefaultRoomButton');
  });

  it('should set gay hall as default room, and get correct message', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.field('defaultIndicator').isPresent()).toBeFalsy();
    page.click('defaultRoomButton');
    page.click('all-rooms');
    page.clickPineHall();
    expect(page.elementExistsWithId('defaultIndicator'));
    expect(page.getTextFromField('defaultIndicator')).toEqual('default');
    // page.click('all-rooms');
    // page.clickGayHall();
    // page.click('unsetDefaultRoomButton');
  });

  it('should have a subscribe button when you select a specific room', () => {
    page.navigateTo();
    page.clickApartment();
    expect(page.elementExistsWithId('subscribeButton'));
  });

  it('should have a disabled subscribe button when click blakely hall', () => {
    page.navigateTo();
    page.click('blakelyId');
    expect(page.button('subscribeButton').isEnabled()).toBe(false);
  });

  it('should have an enabled subscribe button when click the apartments', () => {
    page.navigateTo();
    page.clickApartment();
    expect(page.button('subscribeButton').isEnabled()).toBe(true);
  });

  describe('Subscribe',() => {

    beforeEach(() => {
      page.navigateTo();
      page.clickApartment();
      page.click('subscribeButton');
    });

    it('should open a dialog when click an enabled subscribe button in the apartment', () => {
      expect(page.elementExistsWithId('sub-title'));
    });

    it('should have correct title for the opened dialog when click an enabled subscribe button in the apartment', () => {
      expect(page.getTextWithID('sub-title')).toEqual('New Subscription');
    });

    xit('should have correct checked field for the opened dialog when click an enabled subscribe button in the apartment', async() => {
      // expect(page.boxChecked('sub-dryer').checked).toBe(true);
      // expect(page.boxChecked('sub-type').isSelected()).toBe(true);
      const subDryer = element(by.css('mat-radio-button[id=sub-dryer]'));
      expect(subDryer.getAttribute('class')).toContain('checked');
      expect(subDryer.attributes.length).toContain('disabled');
      // const subDryerAttri = subDryer.getAttribute('mat-radio-checked');
      // expect(subDryerAttri).not.toBe(null);
      // expect(await subDryerAttri).toBeTruthy();
    });

    xit('should have a disabled check box for washer in the apartment', () => {
      // expect(page.buttonClickable('sub-washer')).toBe(false);
      const subWasher = element(by.css('mat-radio-button[id=sub-washer]'));
      expect(subWasher.getAttribute('class')).toContain('disabled');
      // const subWasherAttri = subWasher.getAttribute('[disabled]');
      // expect(subWasherAttri).not.toBe(null);
      // expect(element(by.css('mat-radio-button[id=sub-washer]')).getAttribute('disabled')).toBeTruthy();
      // expect(element(by.id('sub-washer')).getAttribute('disabled')).toBe('disabled');
      // expect(page.field('sub-washer').isEnabled()).toBe(false);
      // expect(page.getTextFromField('sub-washer-true')).toBe('washer');
      // expect(page.getTextFromField('sub-dryer-false')).toBe('dryer');
    });

    describe('Subscribe (Validation)', () => {

      afterEach(() => {
        page.click('exitWithoutAddingButton');
      });

      it('Should show the validation error message about email being required', () => {
        expect(page.field('emailField').isPresent()).toBeTruthy('There should be an email field');
        page.field('emailField').clear();
        expect(page.button('confirmAddSubButton').isEnabled()).toBe(false);
        // clicking somewhere else will make the error appear
        browser.actions().sendKeys(Key.TAB).perform();
        browser.actions().sendKeys(Key.TAB).perform();
        expect(page.getTextFromField('email-error')).toEqual('Email is required');
      });

      it('Should show the validation error message about email format', () => {
        expect(page.field('emailField').isPresent()).toBeTruthy('There should be an email field');
        page.field('emailField').clear();
        page.field('emailField').sendKeys('donjones.com');
        expect(page.button('confirmAddSubButton').isEnabled()).toBe(false);
        // clicking somewhere else will make the error appear
        browser.actions().sendKeys(Key.TAB).perform();
        expect(page.getTextFromField('email-error')).toEqual('Email must be formatted properly');
      });

    });
  });



  // it('should not have a subscribe button when you select all room', () => {
  //   page.navigateTo();
  //   page.clickAllRooms()
  //   expect(('subscribeButton'));
  // })
});

