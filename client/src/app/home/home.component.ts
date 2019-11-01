import {Component, OnInit} from '@angular/core';
import {Room} from './room';
import {Machine} from './machine';
import {Observable} from 'rxjs';
import {HomeService} from './home.service';

import * as Chart from 'chart.js';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  /*
   * This is a switch for the E2E test
   * before running the tests
   * set autoRefresh to be true,
   * after testing, set the boolean
   * back to true in order to make
   * the functionality works.
   */
  private autoRefresh = true;

  public machineListTitle: string;
  public brokenMachineListTitle: string;
  public rooms: Room[];
  public machines: Machine[];
  public filteredMachines: Machine[];
  public numOfBroken: number;
  public numOfWashers: number;
  public numOfDryers: number;

  public roomId: string;
  public roomName: string;
  public selectorState: number;
  public numOfVacant: number;
  public numOfAll: number;

  canvas: any;
  ctx: any;
  myChart: any;
  graphMode = 'line';
  chart='myChart';
  public inputRoom = "all";
  public history: History[];
  public filteredHistory: History;
  public inputDay = 1;
  public gayHistory: History[];
  public independenceHistory: History;
  public blakelyHistory: History;
  public spoonerHistory: History;
  public greenPrairieHistory: History;
  public pineHistory: History;
  public theApartmentsHistory: History;

  constructor(public homeService: HomeService) {
    this.machineListTitle = 'available within all rooms';
    this.brokenMachineListTitle = 'Unavailable machines within all rooms';
  }

  setSelector(state: number) {
    this.selectorState = state;
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.machineListTitle = 'available within ' + this.roomName;
    this.brokenMachineListTitle = 'Unavailable machines within ' + this.roomName;
    this.updateMachines();
    this.setSelector(1);
  }

  private updateMachines(): void {
    if (this.roomId == null || this.roomId === '') {
      this.filteredMachines = this.machines;
    } else {
      this.filteredMachines = this.machines.filter(machine => machine.room_id === this.roomId);
    }
    this.homeService.updateRunningStatus(this.filteredMachines, this.machines);
    if (this.filteredMachines !== undefined) {
      this.numOfBroken = this.filteredMachines.filter(m => m.status === 'broken').length;
      this.numOfWashers = this.filteredMachines.filter(m => m.status === 'normal' && m.type === 'washer').length;
      this.numOfDryers = this.filteredMachines.filter(m => m.status === 'normal' && m.type === 'dryer').length;
    }
  }

  filterGraphData(){
    if (this.inputRoom !== 'all'){
      this.filteredHistory = this.history.filter(history => history.room_id === this.inputRoom);

    } else {
      this.gayHistory = this.history.filter(history => history.room_id === 'gay');
      this.independenceHistory = this.history.filter(history => history.room_id === 'independence');
      this.blakelyHistory = this.history.filter(history => history.room_id === 'blakely');
      this.spoonerHistory = this.history.filter(history => history.room_id === 'spooner');
      this.greenPrairieHistory = this.history.filter(history => history.room_id === 'green_prairie');
      this.pineHistory = this.history.filter(history => history.room_id === 'pine');
      this.theApartmentsHistory = this.history.filter(history => history.room_id === 'the_apartments');
    }
  }

  getWeekDayByRoom(room, wekd): number[] {
    let tempWekd: Array<number> = [];
    for (var i = 0; i < 48; i++){
      var a = this.history.filter(history => history.room_id === room).pop()[wekd][i];
      tempWekd.push(a);
      this.gayHistory = this.history.filter(history => history.room_id === room);
    }
    return tempWekd
  }

  loadAllMachines(): void {
    const machines: Observable<Machine[]> = this.homeService.getMachines();
    machines.subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      machines => {
        this.machines = machines;
      },
      err => {
        console.log(err);
      });
  }

  loadAllRooms(): void {
    const rooms: Observable<Room[]> = this.homeService.getRooms();
    rooms.subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      rooms => {
        this.rooms = rooms;
      },
      err => {
        console.log(err);
      });
  }

  loadAllHistory(): void {
    const history: Observable<History[]> = this.homeService.getAllHistory();
    history.subscribe(
      history => {
        this.history = history;
      },
      err => {
        console.log(err);
      });
  }

  buildChart(){
    this.canvas = document.getElementById(this.chart);
    this.ctx = this.canvas;

    let xlabel;
    this.filterGraphData();

    console.log("i'm ok here");
    console.log(this.inputDay);
    console.log(this.getWeekDayByRoom('gay', this.inputDay));

    xlabel = ['0a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a',
      '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p',
      '9p', '10p', '11p']

    if(this.inputRoom !== 'all') {
      this.myChart = new Chart(this.ctx, {
        type: 'bar',
        data: {
          labels: xlabel,
          datasets: [{
            data: this.getWeekDayByRoom(this.inputRoom,this.inputDay),
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    } else {
      this.myChart = new Chart(this.ctx, {
        type: 'line',
        data: {
          labels: xlabel,
          datasets: [
            {
              labal: "Gay",
              data: this.getWeekDayByRoom('gay',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Independence",
              data: this.getWeekDayByRoom('independence',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Blakely",
              data: this.getWeekDayByRoom('blakely',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Spooner",
              data: this.getWeekDayByRoom('spooner',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Green Prairie",
              data: this.getWeekDayByRoom('green_prairie',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Pine",
              data: this.getWeekDayByRoom('pine',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
            {
              labal: "Apartments",
              data: this.getWeekDayByRoom('the_apartments',this.inputDay),
              hidden: false,
              fill: false,
              lineTension: 0.2,
            },
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }

  }

  ngOnInit(): void {
    (async () => {
      this.setSelector(0);
      this.loadAllRooms();
      this.loadAllMachines();
      this.loadAllHistory();

      await this.delay(1000); // wait 1s for loading data

      this.buildChart();
      this.updateMachines();
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateCounter();
      this.updateTime();
    }) ();
  }

  updateTime(): void {
    (async () => {
      this.loadAllMachines();
      this.homeService.updateRunningStatus(this.filteredMachines, this.machines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateCounter();
      if (this.autoRefresh) {
        await this.delay(60000); // hold 60s for the next refresh
        console.log('Refresh');
        this.updateTime();
      }
    }) ();
  }

  updateCounter(): void {
    this.numOfVacant = 0;
    this.numOfAll = 0;
    if (this.rooms !== undefined) {
      this.rooms.map(r => {
        this.numOfVacant += r.numberOfAvailableMachines;
        this.numOfAll += r.numberOfAllMachines;
      });
    } else {
      this.numOfVacant = 0;
      this.numOfAll = 0;
    }
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
