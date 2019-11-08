import {AppPage} from './app.po';

xdescribe('angular-spark-lab', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should load', () => {
    page.navigateTo();
  });

  it('should get and highlight Home title attribute ', () => {
    page.navigateTo();
    expect(page.getPageTitle()).toEqual('Morris Laundry Facilities');
  });
});
