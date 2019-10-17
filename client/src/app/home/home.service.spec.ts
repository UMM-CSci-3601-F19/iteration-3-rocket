import {Observable} from 'rxjs';
import {Room} from './room';
import {Machine} from './machine';
import {HomeService} from './home.service';
import {HomeComponent} from './home.component';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';


describe('Home list Service', () => {
  const testMachines: Machine[] = [
    {
      id: 'bf354528bwhsg',
      running: false,
      status: 'normal',
      room_id: 'CSCI',
      type: 'washer',

      remainingTime: null,
      vacantTime: null,
    },
    {
      id: '67gsafy908c',
      running: true,
      status: 'normal',
      room_id: 'CSCI',
      type: 'dryer',


      remainingTime: null,
      vacantTime: null,
    },
    {
      id: 'ng6755jsg78',
      running: false,
      status: 'broken',
      room_id: 'room',
      type: 'washer',

      remainingTime: null,
      vacantTime: null,
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
      machine => expect(machine).toBe(testMachines));
    const req = httpTestingController.expectOne(homeService.baseUrl + 'machines');
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    req.flush(testMachines);
  });

  it('getMachinesAtRoom() calls api/machine/room_id', () => {
    const targetMachine: Machine = testMachines[1];
    const targetRoom: string = targetMachine.room_id;
    homeService.getMachinesAtRoom(targetRoom).subscribe(
      machine => expect(machine).toBe(machine)
    );
    const req = httpTestingController.expectOne(homeService.baseUrl + 'rooms/' + targetRoom + '/machines' );
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    req.flush(testMachines);
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

  it('contains a room_id of gay_hall', () => {
    expect(testMachines.some((machine: Machine) => machine.room_id === 'gay_hall')).toBe(false);
  });

  it('contains all the machines', () => {
    expect(testMachines.length).toBe(3);
  });
});
