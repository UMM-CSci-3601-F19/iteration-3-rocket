import {TestBed, ComponentFixture} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CustomModule} from '../custom.module';
import {HomeService} from './home.service';
import {Machine} from './machine';
import {Room} from './room';
import {Observable} from 'rxjs';

describe('Home', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let df: DebugElement;
  let dg: DebugElement;
  let dh: DebugElement;
  let el: HTMLElement;
  let fl: HTMLElement;
  let gl: HTMLElement;
  let hl: HTMLElement;

  let homeServiceStub: {
    getRooms: () => Observable<Room[]>;
    getMachines: () => Observable<Machine[]>
  };

  beforeEach(() => {
    homeServiceStub = {
      getMachines: () => Observable.of([{
        id: 'string',
        running: false,
        status: 'normal',
        room_id: 'room',
        type: 'washer',

        previousRunningState: null,
        remainingTime: null,
        vacantTime: null,
      }]),
      getRooms: () => Observable.of([{
        id: 'string',
        name: 'room',
        numberOfAllMachines: null,
        numberOfAvailableMachines: null,
      }])
    };
    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [HomeComponent], // declare the test component
      providers: [{provide: HomeService, useValue: homeServiceStub}]
    });

    fixture = TestBed.createComponent(HomeComponent);

    component = fixture.componentInstance; // BannerComponent test instance

    // query for the link (<a> tag) by CSS element selector
    de = fixture.debugElement.query(By.css('#home-rooms-card'));
    df = fixture.debugElement.query(By.css('#home-machines-card-washer'));
    dg = fixture.debugElement.query(By.css('#home-machines-card-dryer'));
    dh = fixture.debugElement.query(By.css('#home-machines-card-broken'));
    el = de.nativeElement;
    fl = df.nativeElement;
    gl = dg.nativeElement;
    hl = dh.nativeElement;
  });

  it('displays a text of rooms', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain('Select a Laundry Room Here');
  });

  it('displays a text of washers', () => {
    fixture.detectChanges();
    expect(fl.textContent).toContain('Washers available within all rooms');
  });

  it('displays a text of dryers', () => {
    fixture.detectChanges();
    expect(gl.textContent).toContain('Dryers available within all rooms');
  });

  it('displays a text of broken machines', () => {
    fixture.detectChanges();
    expect(hl.textContent).toContain('Unavailable machines within all rooms');
  });
});
