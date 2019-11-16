import {Room} from './room';
import {Machine} from './machine';
import {History} from './history'
import {HomeService} from './home.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';


describe('Home list Service', () => {
  const testMachines: Machine[] = [
    {
      id: 'bf354528bwhsg',
      name: '',
      running: false,
      status: 'normal',
      room_id: 'room_a',
      type: 'washer',
      position: {
        x: 0,
        y: 0,
      },
      remainingTime: null,
      vacantTime: null,
    },
    {
      id: '67gsafy908c',
      name: '',
      running: true,
      status: 'normal',
      room_id: 'room_a',
      type: 'dryer',
      position: {
        x: 0,
        y: 0,
      },
      remainingTime: null,
      vacantTime: null,
    },
    {
      id: 'ng6755jsg78',
      name: '',
      running: false,
      status: 'broken',
      room_id: 'room_b',
      type: 'washer',
      position: {
        x: 0,
        y: 0,
      },
      remainingTime: null,
      vacantTime: null,
    }
  ];
  const testRooms: Room[] = [
    {
      id: 'room_a',
      name: 'A',

      isSubscribed: false,

      numberOfAllMachines: null,
      numberOfAvailableMachines: null,
    },
    {
      id: 'room_b',
      name: 'B',

      isSubscribed: false,

      numberOfAllMachines: null,
      numberOfAvailableMachines: null,
    },
  ];

  const testHistory: History[] = [
    {
      "1": {
        "0": 10,
        "1": 5,
        "2": 2,
        "3": 2,
        "4": 3,
        "5": 2,
        "6": 6,
        "7": 3,
        "8": 1,
        "9": 8,
        "10": 4,
        "11": 2,
        "12": 3,
        "13": 3,
        "14": 7,
        "15": 2,
        "16": 9,
        "17": 6,
        "18": 0,
        "19": 4,
        "20": 8,
        "21": 8,
        "22": 10,
        "23": 5,
        "24": 10,
        "25": 3,
        "26": 8,
        "27": 1,
        "28": 0,
        "29": 10,
        "30": 2,
        "31": 5,
        "32": 4,
        "33": 3,
        "34": 7,
        "35": 0,
        "36": 1,
        "37": 3,
        "38": 8,
        "39": 5,
        "40": 0,
        "41": 9,
        "42": 0,
        "43": 8,
        "44": 4,
        "45": 4,
        "46": 8,
        "47": 3
      },
      "2": {
        "0": 6,
        "1": 2,
        "2": 6,
        "3": 8,
        "4": 1,
        "5": 4,
        "6": 4,
        "7": 6,
        "8": 3,
        "9": 5,
        "10": 5,
        "11": 9,
        "12": 7,
        "13": 2,
        "14": 10,
        "15": 6,
        "16": 5,
        "17": 6,
        "18": 8,
        "19": 9,
        "20": 7,
        "21": 2,
        "22": 4,
        "23": 6,
        "24": 8,
        "25": 5,
        "26": 5,
        "27": 2,
        "28": 9,
        "29": 2,
        "30": 5,
        "31": 10,
        "32": 3,
        "33": 5,
        "34": 2,
        "35": 7,
        "36": 9,
        "37": 5,
        "38": 7,
        "39": 5,
        "40": 4,
        "41": 0,
        "42": 0,
        "43": 0,
        "44": 2,
        "45": 10,
        "46": 1,
        "47": 2
      },
      "3": {
        "0": 9,
        "1": 0,
        "2": 3,
        "3": 9,
        "4": 5,
        "5": 9,
        "6": 3,
        "7": 2,
        "8": 7,
        "9": 0,
        "10": 10,
        "11": 3,
        "12": 4,
        "13": 10,
        "14": 1,
        "15": 9,
        "16": 3,
        "17": 5,
        "18": 3,
        "19": 9,
        "20": 9,
        "21": 4,
        "22": 0,
        "23": 1,
        "24": 8,
        "25": 3,
        "26": 9,
        "27": 4,
        "28": 1,
        "29": 7,
        "30": 1,
        "31": 5,
        "32": 9,
        "33": 7,
        "34": 6,
        "35": 7,
        "36": 3,
        "37": 0,
        "38": 7,
        "39": 9,
        "40": 6,
        "41": 4,
        "42": 1,
        "43": 4,
        "44": 1,
        "45": 8,
        "46": 0,
        "47": 3
      },
      "4": {
        "0": 4,
        "1": 1,
        "2": 9,
        "3": 3,
        "4": 1,
        "5": 8,
        "6": 9,
        "7": 7,
        "8": 4,
        "9": 5,
        "10": 8,
        "11": 1,
        "12": 3,
        "13": 4,
        "14": 6,
        "15": 6,
        "16": 4,
        "17": 5,
        "18": 5,
        "19": 3,
        "20": 1,
        "21": 5,
        "22": 6,
        "23": 9,
        "24": 0,
        "25": 3,
        "26": 6,
        "27": 2,
        "28": 1,
        "29": 8,
        "30": 1,
        "31": 10,
        "32": 2,
        "33": 5,
        "34": 2,
        "35": 9,
        "36": 3,
        "37": 4,
        "38": 9,
        "39": 10,
        "40": 6,
        "41": 8,
        "42": 7,
        "43": 8,
        "44": 6,
        "45": 3,
        "46": 1,
        "47": 5
      },
      "5": {
        "0": 7,
        "1": 5,
        "2": 7,
        "3": 2,
        "4": 6,
        "5": 3,
        "6": 4,
        "7": 6,
        "8": 3,
        "9": 9,
        "10": 0,
        "11": 10,
        "12": 6,
        "13": 8,
        "14": 4,
        "15": 5,
        "16": 8,
        "17": 5,
        "18": 8,
        "19": 10,
        "20": 8,
        "21": 8,
        "22": 3,
        "23": 3,
        "24": 9,
        "25": 5,
        "26": 2,
        "27": 0,
        "28": 10,
        "29": 5,
        "30": 10,
        "31": 10,
        "32": 10,
        "33": 3,
        "34": 8,
        "35": 2,
        "36": 7,
        "37": 2,
        "38": 6,
        "39": 0,
        "40": 5,
        "41": 3,
        "42": 8,
        "43": 4,
        "44": 1,
        "45": 9,
        "46": 0,
        "47": 4
      },
      "6": {
        "0": 8,
        "1": 7,
        "2": 3,
        "3": 9,
        "4": 9,
        "5": 4,
        "6": 1,
        "7": 3,
        "8": 4,
        "9": 1,
        "10": 7,
        "11": 6,
        "12": 7,
        "13": 3,
        "14": 8,
        "15": 4,
        "16": 1,
        "17": 9,
        "18": 5,
        "19": 7,
        "20": 6,
        "21": 0,
        "22": 1,
        "23": 2,
        "24": 1,
        "25": 9,
        "26": 2,
        "27": 2,
        "28": 9,
        "29": 4,
        "30": 5,
        "31": 6,
        "32": 8,
        "33": 2,
        "34": 2,
        "35": 5,
        "36": 7,
        "37": 0,
        "38": 4,
        "39": 9,
        "40": 1,
        "41": 10,
        "42": 10,
        "43": 10,
        "44": 0,
        "45": 4,
        "46": 5,
        "47": 5
      },
      "7": {
        "0": 2,
        "1": 4,
        "2": 2,
        "3": 3,
        "4": 8,
        "5": 5,
        "6": 9,
        "7": 0,
        "8": 5,
        "9": 2,
        "10": 9,
        "11": 4,
        "12": 9,
        "13": 0,
        "14": 2,
        "15": 9,
        "16": 10,
        "17": 5,
        "18": 1,
        "19": 1,
        "20": 7,
        "21": 2,
        "22": 4,
        "23": 10,
        "24": 3,
        "25": 6,
        "26": 8,
        "27": 10,
        "28": 7,
        "29": 5,
        "30": 9,
        "31": 6,
        "32": 7,
        "33": 1,
        "34": 9,
        "35": 10,
        "36": 4,
        "37": 5,
        "38": 10,
        "39": 0,
        "40": 0,
        "41": 1,
        "42": 9,
        "43": 0,
        "44": 2,
        "45": 7,
        "46": 2,
        "47": 2
      },
      "_id": "5dbb7ca7d8ba936a8e8d9e3f",
      "room_id": "gay"
    }
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
        name: '',
        running: true,
        status: 'normal',
        room_id: 'room_a',
        type: 'washer',
        position: {
          x: 0,
          y: 0,
        },
        remainingTime: 100,
        vacantTime: -1,
      },
      {
        id: '67gsafy908c',
        name: '',
        running: false,
        status: 'normal',
        room_id: 'room_a',
        type: 'dryer',
        position: {
          x: 0,
          y: 0,
        },
        remainingTime: -1,
        vacantTime: 10,
      },
      {
        id: 'ng6755jsg78',
        name: '',
        running: false,
        status: 'broken',
        room_id: 'room_b',
        type: 'washer',
        position: {
          x: 0,
          y: 0,
        },
        remainingTime: 34,
        vacantTime: -1,
      }
    ];

    homeService.updateRunningStatus(testMachines, updatedMachines);
    expect(testMachines[0].running).toBe(true);
    expect(testMachines[0].remainingTime).toBe(100);
    expect(testMachines[0].vacantTime).toBe(-1);
  });

  it('getAllHistory() retrieves history for all machines', () => {
    homeService.getAllHistory().subscribe(
      history => expect(history).toBe(testHistory));
    const req = httpTestingController.expectOne(homeService.baseUrl + '/all_history');
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    req.flush(testHistory);
  });
});
