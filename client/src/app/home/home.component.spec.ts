import {TestBed, ComponentFixture} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CustomModule} from '../custom.module';

describe('Home', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let df: DebugElement;
  let el: HTMLElement;
  let fl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [HomeComponent], // declare the test component
    });

    fixture = TestBed.createComponent(HomeComponent);

    component = fixture.componentInstance; // BannerComponent test instance

    // query for the link (<a> tag) by CSS element selector
    de = fixture.debugElement.query(By.css('#home-rooms-card'));
    df = fixture.debugElement.query(By.css('#home-machines-card'));
    el = de.nativeElement;
    fl = df.nativeElement;
  });

  // it('displays a text of rooms', () => {
  //   fixture.detectChanges();
  //   expect(el.textContent).toContain("Rooms!");
  // });

  // it('displays a text of machines', () => {
  //   fixture.detectChanges();
  //   expect(fl.textContent).toContain("Machines!");
  // });
});
