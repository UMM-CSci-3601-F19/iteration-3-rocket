import {Component, OnInit} from '@angular/core';
import {Room} from './room';
import {History} from './history';
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
  // graphMode = 'line';
  chart='myChart';
  public inputRoom = "all";
  public history: History[];
  public filteredHistory: History[];
  public inputDay = 1;
  /*
  public gayHistory: History[];
  public independenceHistory: History;
  public blakelyHistory: History;
  public spoonerHistory: History;
  public greenPrairieHistory: History;
  public pineHistory: History;
  public theApartmentsHistory: History;
*/
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

    } /*else {

      this.gayHistory = this.history.filter(history => history.room_id === 'gay');
      this.independenceHistory = this.history.filter(history => history.room_id === 'independence');
      this.blakelyHistory = this.history.filter(history => history.room_id === 'blakely');
      this.spoonerHistory = this.history.filter(history => history.room_id === 'spooner');
      this.greenPrairieHistory = this.history.filter(history => history.room_id === 'green_prairie');
      this.pineHistory = this.history.filter(history => history.room_id === 'pine');
      this.theApartmentsHistory = this.history.filter(history => history.room_id === 'the_apartments');
    }*/
  }

  getWeekDayByRoom(room, wekd): number[] {
    let tempWekd: Array<number> = [];
    for (let i = 0; i < 48; i++){
      let a = this.history.filter(history => history.room_id === room).pop()[wekd][i];
      tempWekd.push(a);
    }
    return tempWekd
  }

  modifyArray(arr): number[]{
    let temp: Array<number> = [];
    for (let i = 0; i < 48; i = i + 6){
      let sum = 0;
      for (let j = 0; j < 6; j++){
        sum = sum + arr[j + i];
      }
      temp.push(sum/6);
    }
    return temp;
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
    const histories: Observable<History[]> = this.homeService.getAllHistory();
    histories.subscribe(
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
    let xlabel2;
    this.filterGraphData();

    console.log("i'm ok here");
    console.log(this.inputDay);
    console.log(this.getWeekDayByRoom('gay', this.inputDay));

    xlabel = ['0a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a',
      '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p',
      '9p', '10p', '11p'];

    xlabel2 = ['0a-3a', '3a-6a', '6a-9a', '9a-12p', '12p-3p', '3p-6p', '6p-9p', '9p-12p'];

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
          labels: xlabel2,
          datasets: [
            {
              "labal": "Gay",
              "data": this.modifyArray(this.getWeekDayByRoom('gay',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(255,99,132)',
              backgroundColor: 'rgb(255,99,132)'
            },
            {
              "labal": "Independence",
              data: this.modifyArray(this.getWeekDayByRoom('independence',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgb(54, 162, 235)'
            },
            {
              "labal": "Blakely",
              data: this.modifyArray(this.getWeekDayByRoom('blakely',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(255, 206, 86)',
              backgroundColor: 'rgb(255, 206, 86)'
            },
            {
              "labal": "Spooner",
              data: this.modifyArray(this.getWeekDayByRoom('spooner',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgb(75, 192, 192)'
            },
            {
              "labal": "Green Prairie",
              data: this.modifyArray(this.getWeekDayByRoom('green_prairie',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgb(153, 102, 255)'
            },
            {
              "labal": "Pine",
              data: this.modifyArray(this.getWeekDayByRoom('pine',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgb(255, 159, 64)'
            },
            {
              labal: 'Apartments',
              data: this.modifyArray(this.getWeekDayByRoom('the_apartments',this.inputDay)),
              hidden: false,
              fill: false,
              lineTension: 0.2,
              borderColor: 'rgb(100,100,100)',
              backgroundColor: 'rgb(100,100,100)'
            },
          ]
        },
        options: {
          elements: {
            point: {
              radius: 0
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                display: false,
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
