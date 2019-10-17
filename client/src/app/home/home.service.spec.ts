import {Room} from './room';
import {Machine} from './machine';
import {HomeService} from './home.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';


describe('Home list Service', () => {
  const testMachines: Machine[] = [
    {
      id: 'bf354528bwhsg',
      running: false,
      status: 'normal',
      room_id: 'room_a',
      type: 'washer',

      remainingTime: null,
      vacantTime: null,
    },
    {
      id: '67gsafy908c',
      running: true,
      status: 'normal',
      room_id: 'room_a',
      type: 'dryer',

      remainingTime: null,
      vacantTime: null,
    },
    {
      id: 'ng6755jsg78',
      running: false,
      status: 'broken',
      room_id: 'room_b',
      type: 'washer',

      remainingTime: null,
      vacantTime: null,
    }
  ];
  const testRooms: Room[] = [
    {
      id: 'room_a',
      name: 'A',

      numberOfAllMachines: null,
      numberOfAvailableMachines: null,
    },
    {
      id: 'room_b',
      name: 'B',

      numberOfAllMachines: null,
      numberOfAvailableMachines: null,
    },
  ];

  let homeService: HomeService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    homeService = new HomeService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });


  it('getMachines() calls api/machines', () => {
    homeService.getMachines().subscribe(
      machines => expect(machines).toBe(testMachines));
    const req = httpTestingController.expectOne(homeService.baseUrl + 'machines');
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    req.flush(testMachines);
  });

  it('getRooms() calls api/rooms', () => {
    homeService.getRooms().subscribe(
      rooms => expect(rooms).toBe(testRooms));
    const req = httpTestingController.expectOne(homeService.baseUrl + 'rooms');
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    req.flush(testRooms);
  });

  it('contains a machine with id ng6755jsg78', () => {
    expect(testMachines.some((machine: Machine) => machine.id === 'ng6755jsg78')).toBe(true);
  });

  it('contains 2 types of washer', () => {
    expect(testMachines.filter((machine: Machine) => machine.type === 'washer').length).toBe(2);
  });

  it('contains a broken machine', () => {
    expect(testMachines.some((machine: Machine) => machine.status === 'broken')).toBe(true);
  });

  it('does not contain a room_id of gay_hall', () => {
    expect(testMachines.some((machine: Machine) => machine.room_id === 'gay_hall')).toBe(false);
  });

  it('update Available Machine Numbers', () => {
    homeService.updateAvailableMachineNumber(testRooms, testMachines);
    expect(testRooms[0].numberOfAllMachines).toBe(2);
    expect(testRooms[0].numberOfAvailableMachines).toBe(1);
    expect(testRooms[1].numberOfAllMachines).toBe(0);
  });

  it('skip if rooms is not initialized', () => {
    let exp;
    try {
      homeService.updateAvailableMachineNumber(null, testMachines);
    } catch (e) {
      exp = e;
    }
    expect(exp).toBeUndefined();
  });

  it('update Running Status', () => {
    const updatedMachines: Machine[] = [
      {
        id: 'bf354528bwhsg',
        running: true,
        status: 'normal',
        room_id: 'room_a',
        type: 'washer',

        remainingTime: 100,
        vacantTime: -1,
      },
      {
        id: '67gsafy908c',
        running: false,
        status: 'normal',
        room_id: 'room_a',
        type: 'dryer',

        remainingTime: -1,
        vacantTime: 10,
      },
      {
        id: 'ng6755jsg78',
        running: false,
        status: 'broken',
        room_id: 'room_b',
        type: 'washer',

        remainingTime: 34,
        vacantTime: -1,
      }
    ];

    homeService.updateRunningStatus(testMachines, updatedMachines);
    expect(testMachines[0].running).toBe(true);
    expect(testMachines[0].remainingTime).toBe(100);
    expect(testMachines[0].vacantTime).toBe(-1);
  });
});
