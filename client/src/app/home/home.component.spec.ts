import {TestBed, ComponentFixture} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CustomModule} from '../custom.module';
import {HomeService} from './home.service';
import {Machine} from './machine';
import {Room} from './room';
import {History} from './history';
import {Observable} from 'rxjs';

describe('Home page', () => {

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
    getMachines: () => Observable<Machine[]>;
    getAllHistory: () => Observable<History[]>;
    updateRunningStatus;
  };

  // @ts-ignore
  beforeEach(() => {
    homeServiceStub = {
      getMachines: () => Observable.of([
        {
          id: 'id_1',
          running: false,
          status: 'normal',
          room_id: 'room_a',
          type: 'washer',

          remainingTime: -1,
          vacantTime: 10,
        }, {
          id: 'id_2',
          running: true,
          status: 'normal',
          room_id: 'room_b',
          type: 'dryer',

          remainingTime: 10,
          vacantTime: -1,
        },
      ]),
      getRooms: () => Observable.of([
        {
          id: 'room_a',
          name: 'A',

          numberOfAllMachines: 1,
          numberOfAvailableMachines: 1,
        }, {
          id: 'room_b',
          name: 'B',

          numberOfAllMachines: 1,
          numberOfAvailableMachines: 0,
        },
      ]),
      getAllHistory: () => Observable.of([
        {
          1: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          2: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          3: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          4: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          5: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          6: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          7: {
            0: 10,
            1: 5,
            2: 2,
            3: 2,
            4: 3,
            5: 2,
            6: 6,
            7: 3,
            8: 1,
            9: 8,
            10: 4,
            11: 2,
            12: 3,
            13: 3,
            14: 7,
            15: 2,
            16: 9,
            17: 6,
            18: 0,
            19: 4,
            20: 8,
            21: 8,
            22: 10,
            23: 5,
            24: 10,
            25: 3,
            26: 8,
            27: 1,
            28: 0,
            29: 10,
            30: 2,
            31: 5,
            32: 4,
            33: 3,
            34: 7,
            35: 0,
            36: 1,
            37: 3,
            38: 8,
            39: 5,
            40: 0,
            41: 9,
            42: 0,
            43: 8,
            44: 4,
            45: 4,
            46: 8,
            47: 3
          },
          "_id": "5dbb7ca7d8ba936a8e8d9e3f",
          "room_id": "gay"
        },
      ]),
      updateRunningStatus: () => null,
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
    expect(el.textContent).toContain('Please select a laundry room here');
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

  it('load all the machines', () => {
    const machines: Observable<Machine[]> = homeServiceStub.getMachines();
    machines.subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      machines => {
        component.machines = machines;
      });
    expect(component.machines.length).toBe(2);
  });

  it('load all the rooms', () => {
    const rooms: Observable<Room[]> = homeServiceStub.getRooms();
    rooms.subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      rooms => {
        component.rooms = rooms;
      });
    expect(component.rooms.length).toBe(2);
  });

  it('should load and update the time remaining', () => {
    let spy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    spy = spyOn(component, 'updateTime');
    component.updateTime();
    expect(spy).toHaveBeenCalled();
  });

  it('should the machine counters', () => {
    expect(component.numOfVacant).toBe(undefined);
    expect(component.numOfAll).toBe(undefined);
    component.updateCounter();
    expect(component.numOfVacant).toBe(0);
    expect(component.numOfAll).toBe(0);
    const rooms: Observable<Room[]> = homeServiceStub.getRooms();
    rooms.subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      rooms => {
        component.rooms = rooms;
      });
    component.updateCounter();
    expect(component.numOfVacant).toBe(1);
    expect(component.numOfAll).toBe(2);
  });
});
