import {HomePage} from './home.po';
import {browser, protractor} from 'protractor';
import {Key} from 'selenium-webdriver';

// This line (combined with the function that follows) is here for us
// to be able to see what happens (part of slowing things down)
// https://hassantariqblog.wordpress.com/2015/11/09/reduce-speed-of-angular-e2e-protractor-tests/

const origFn = browser.driver.controlFlow().execute;

browser.driver.controlFlow().execute = function () {
  const args = arguments;

  // queue 100ms wait between test
  // This delay is only put here so that you can watch the browser do its thing.
  // If you're tired of it taking long you can remove this call or change the delay
  // to something smaller (even 0).
  origFn.call(browser.driver.controlFlow(), () => {
    return protractor.promise.delayed(0);
  });

  return origFn.apply(browser.driver.controlFlow(), args);
};


describe('home', () => {
  let page: HomePage;

  beforeEach(() => {
    page = new HomePage();
  });

  it('should get and highlight Home panel title attribute', () => {
    page.navigateTo();
    expect(page.getHomePanelTitle()).toEqual('Please select a laundry room here');
  });

  it('should get and highlight each hall title attribute', () => {
    page.navigateTo();
    expect(page.getGayHallTitleInHomePanel()).toEqual('Gay Hall');
    expect(page.getIndependenceHallTitleInHomePanel()).toEqual('Independence Hall');
    expect(page.getBlakelyHallTitleInHomePanel()).toEqual('Blakely Hall');
    expect(page.getSpoonerHallTitleInHomePanel()).toEqual('Spooner Hall');
    expect(page.getGreenPrairieHallTitleInHomePanel()).toEqual('Green Prairie');
    expect(page.getPineHallTitleInHomePanel()).toEqual('Pine Hall');
    expect(page.getApartmentHallTitleInHomePanel()).toEqual('The Apartments');
  });

  it('should get and highlight each hall availability attribute', () => {
    page.navigateTo();
    expect(page.getGayHallAvailability()).toEqual('7 / 9 vacant');
    expect(page.getIndependenceHallAvailability()).toEqual('8 / 15 vacant');
    expect(page.getBlakelyHallAvailability()).toEqual('7 / 11 vacant');
    expect(page.getSpoonerHallAvailability()).toEqual('5 / 6 vacant');
    expect(page.getGreenPrairieHallAvailability()).toEqual('5 / 7 vacant');
    expect(page.getPineHallAvailability()).toEqual('4 / 5 vacant');
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

  it('should change time left in panel title', () => {
    page.navigateTo();
    const a = page.getUniqueMachine('69dacaa7-ee11-11e9-8256-56000218142a');
    browser.sleep(60000);
    page.navigateTo();
    const b = page.getUniqueMachine('69dacaa7-ee11-11e9-8256-56000218142a');
    expect(a).not.toEqual(b);
  }, 100000);
});

