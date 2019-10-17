// @ts-ignore
import {HomePage} from './home.po';
import {browser, protractor, element, by} from 'protractor';
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
    return protractor.promise.delayed(10);
  });
  return origFn.apply(browser.driver.controlFlow(), args);
};

describe('home', () => {
  let page: HomePage;

  beforeEach(() => {
    page = new HomePage();
  });
  it('should load', () => {
    page.navigateTo();
  });
  it('should get and highlight Home panel title attribute ', () => {
    page.navigateTo();
    console.log('spec1');
    expect(page.getHomePanelTitle()).toEqual('Please select a laundry room here');
    console.log('spec2');
  });
  it('should get and highlight each hall title attribute ', () => {
    page.navigateTo();
    console.log('spec2');
    expect(page.getGayHallTitleInHomePanel()).toEqual('Gay Hall');
    expect(page.getIndependenceHallTitleInHomePanel()).toEqual('Independence Hall');
    expect(page.getBlakelyHallTitleInHomePanel()).toEqual('Blakely Hall');
    expect(page.getSpoonerHallTitleInHomePanel()).toEqual('Spooner Hall');
    expect(page.getGreenPrairieHallTitleInHomePanel()).toEqual('Green Prarie');
    expect(page.getPineHallTitleInHomePanel()).toEqual('Pine Hall');
    expect(page.getApartmentHallTitleInHomePanel()).toEqual('The Appartments');
  });

  it('should get and highlight gay hall availability attribute ', () => {
    page.navigateTo();
    expect(page.getGayHallAvailability()).toEqual('4 / 9 vacant');
  });
});


