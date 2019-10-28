import {HomePage} from './home.po';
import {browser, protractor} from 'protractor';
import {Key} from 'selenium-webdriver';

// This line (combined with the function that follows) is here for us
// to be able to see what happens (part of slowing things down)
// https://hassantariqblog.wordpress.com/2015/11/09/reduce-speed-of-angular-e2e-protractor-tests/

const origFn = browser.driver.controlFlow().execute;

browser.driver.controlFlow().execute = function () {
  let args = arguments;

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
    expect(page.getGreenPrairieHallTitleInHomePanel()).toEqual('Green Prarie');
    expect(page.getPineHallTitleInHomePanel()).toEqual('Pine Hall');
    expect(page.getApartmentHallTitleInHomePanel()).toEqual('The Appartments');
  });

  it('should get and highlight each hall availability attribute', () => {
    page.navigateTo();
    expect(page.getGayHallAvailability()).toEqual('3 / 8 vacant');
    expect(page.getIndependenceHallAvailability()).toEqual('1 / 9 vacant');
    expect(page.getBlakelyHallAvailability()).toEqual('5 / 6 vacant');
    expect(page.getSpoonerHallAvailability()).toEqual('3 / 11 vacant');
    expect(page.getGreenPrairieHallAvailability()).toEqual('2 / 9 vacant');
    expect(page.getPineHallAvailability()).toEqual('3 / 11 vacant');
    expect(page.getApartmentHallAvailability()).toEqual('3 / 7 vacant');
  });

  it('should get and have correct title for all washers and dryers panel', () => {
    page.navigateTo();
    expect(page.getWashersTitle()).toEqual('Washers available within all rooms');
    expect(page.getDyersTitle()).toEqual('Dryers available within all rooms');
  });

  it('should get and have specific machines', () => {
    page.navigateTo();
    expect(page.getUniqueMachine('61382fd7-8444-4956-b951-51052f20c0e3'));
    expect(page.getUniqueMachine('8761b8c6-2548-43c9-9d31-ce0b84bcd160'));
  });

  it('should get and have correct title for gay\'s washers and dryers panel', () => {
    page.navigateTo();
    page.clickGayHall();
    expect(page.getWashersTitle()).toEqual('Washers available within Gay Hall');
    expect(page.getDyersTitle()).toEqual('Dryers available within Gay Hall');
  });

  it('should get and have correct number of gay\'s washers', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getWashers().then((washers) => {
      expect(washers.length).toBe(4);
    })
  });

  it('should get and have correct number of gay\'s dryers', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getDryers().then((dryers) => {
      expect(dryers.length).toBe(4);
    })
  });

  it('should get and have correct number of gay\'s broken machines', () => {
    page.navigateTo();
    page.clickGayHall();
    page.getBrokens().then((brokens) => {
      expect(brokens.length).toBe(5);
    })
  });

  it('should get and have correct number of washers and dryers in total when click All Rooms', () => {
    page.navigateTo();
    page.clickGayHall();
    page.clickRoomPanel();
    page.clickAllRooms();
    page.getWashers().then((washers) => {
      expect(washers.length).toBe(31);
    })
    page.getDryers().then((dryers) => {
      expect(dryers.length).toBe(30);
    })
  });

  it('should change time left in panel title', () => {
    page.navigateTo();
    var a = page.getUniqueMachine('f714b475-5db7-4eeb-a6e0-b17921f0c477');
    browser.sleep(60000);
    page.navigateTo();
    var b = page.getUniqueMachine('f714b475-5db7-4eeb-a6e0-b17921f0c477');
    expect(a).not.toEqual(b);
  }, 70000);
});

