import {Component, OnInit, Inject} from '@angular/core';
import {Room} from './room';
import {History} from './history';
import {Machine} from './machine';
import {Observable} from 'rxjs';
import {HomeService} from './home.service';

import * as Chart from 'chart.js';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


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

  public roomId = '';
  public roomName = 'All room';
  public selectorState: number;
  public numOfVacant: number;
  public numOfAll: number;

  public mapWidth: number;
  public mapHeight: number;

  public history: History[];
  // public filteredHistory: History[];
  canvas: any;
  ctx: any;
  myChart: any;
  chart = 'myChart';
  public inputRoom = 'all';
  public today = new Date();
  public inputDay: number = this.today.getDay() + 1;
  Days = [
    {value: 1, name: 'Sunday'},
    {value: 2, name: 'Monday'},
    {value: 3, name: 'Tuesday'},
    {value: 4, name: 'Wednesday'},
    {value: 5, name: 'Thursday'},
    {value: 6, name: 'Friday'},
    {value: 7, name: 'Saturday'},
  ];

  /*
  public gayHistory: History[];
  public independenceHistory: History;
  public blakelyHistory: History;
  public spoonerHistory: History;
  public greenPrairieHistory: History;
  public pineHistory: History;
  public theApartmentsHistory: History;
*/
  constructor(public homeService: HomeService, public dialog: MatDialog) {
    this.machineListTitle = 'available within all rooms';
    this.brokenMachineListTitle = 'Unavailable machines within all rooms';
  }

  openDialog(theMachine: Machine) {
    const dialogRef = this.dialog.open(HomeDialog, {
      width: '500px',
      data: {machine: theMachine}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  setSelector(state: number) {
    this.selectorState = state;
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.machineListTitle = 'available within ' + this.roomName;
    this.brokenMachineListTitle = 'Unavailable machines within ' + this.roomName;
    if (newId === '') {
      this.inputRoom = 'all';
    } else {
      this.inputRoom = newId;
    }
    if (this.myChart !== undefined) { this.myChart.destroy(); }
    this.inputDay = this.today.getDay() + 1;
    this.updateMachines();
    this.fakePositions(this.filteredMachines)
    this.setSelector(1);
    document.getElementById('allMachineList').style.display = 'unset';
    document.getElementById('all-rooms').style.bottom = '2%';
    this.scroll('mainBody');
  }

  private updateMachines(): void {
    // console.log(this.inputRoom);
    this.buildChart();
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
      this.mapHeight = this.filteredMachines.reduce((max, b) => Math.max(max, b.position.y), this.filteredMachines[0].position.y);
      this.mapWidth = this.filteredMachines.reduce((max, b) => Math.max(max, b.position.x), this.filteredMachines[0].position.x);
    }
  }

  // filterGraphData() {
  //   if (this.inputRoom !== 'all') {
  //     this.filteredHistory = this.history.filter(history => history.room_id === this.inputRoom);
  //
  //   } else {
  //
  //     this.gayHistory = this.history.filter(history => history.room_id === 'gay');
  //     this.independenceHistory = this.history.filter(history => history.room_id === 'independence');
  //     this.blakelyHistory = this.history.filter(history => history.room_id === 'blakely');
  //     this.spoonerHistory = this.history.filter(history => history.room_id === 'spooner');
  //     this.greenPrairieHistory = this.history.filter(history => history.room_id === 'green_prairie');
  //     this.pineHistory = this.history.filter(history => history.room_id === 'pine');
  //     this.theApartmentsHistory = this.history.filter(history => history.room_id === 'the_apartments');
  //   }
  // }


  updateDayByButton(num: number) {
    // console.log("in button inputday was" + this.inputDay);
    this.inputDay = (+this.inputDay + +num) % 7;
    // console.log("in button inputday is for now" + this.inputDay);
    if (this.inputDay === 0) {
      this.inputDay = 7;
    }
    this.myChart.destroy();
    this.buildChart();
    // console.log("in button inputday is" + this.inputDay);
  }


  updateDayBySelector(num: number) {
    console.log('in selector inputday was' + this.inputDay);
    this.inputDay = +num;
    if (this.myChart !== undefined) {this.myChart.destroy(); }
    this.buildChart();
    console.log('in selector inputday is' + this.inputDay);
  }

  getWeekDayByRoom(room, wekd): number[] {
    const tempWekd: Array<number> = [];
    if (this.history !== undefined) {
      for (let i = 0; i < 48; i++) {
        const a = this.history.filter(history => history.room_id === room).pop()[wekd][i];
        tempWekd.push(a);
      }
    }
    return tempWekd;
  }

  modifyArray(arr, num): number[] {
    const temp: Array<number> = [];
    for (let i = 0; i < 48; i = i + num) {
      let sum = 0;
      for (let j = 0; j < num; j++) {
        sum = sum + arr[j + i];
      }
      temp.push(sum / num);
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

  buildChart() {
    if (this.history !== undefined) {
      this.canvas = document.getElementById(this.chart);
      this.ctx = this.canvas;

      let xlabel;
      let xlabel2;
      // this.filterGraphData();

      xlabel = ['0a', '', '2a', '', '4a', '', '6a', '', '8a', '', '10a', '', '12p', '', '2p', '', '4p', '',
        '6p', '', '8p', '', '10p', ''];

      xlabel2 = ['0a-3a', '3a-6a', '6a-9a', '9a-12p', '12p-3p', '3p-6p', '6p-9p', '9p-12p'];

      if (this.inputRoom !== 'all') {
        this.myChart = new Chart(this.ctx, {
          type: 'bar',
          data: {
            labels: xlabel,
            datasets: [{
              data: this.modifyArray(this.getWeekDayByRoom(this.inputRoom, this.inputDay), 2),
            }]
          },
          options: {
            legend: {
              display: false,
            },
            tooltips: {
              enabled: false,
              // callbacks: {
              //   label: function(tooltipItem) {
              //     console.log(tooltipItem);
              //     return tooltipItem.yLabel;
              //   }
              // }
            },
            scales: {
              xAxes: [{
                gridLines: {
                  display: false
                },
                // ticks: {
                //   fontColor: 'white'
                // }
              }],
              yAxes: [{
                gridLines: {
                  display: false,
                },
                ticks: {
                  display: false,
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
                label: 'Gay',
                data: this.modifyArray(this.getWeekDayByRoom('gay', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255,99,132)',
                backgroundColor: 'rgb(255,99,132)'
              },
              {
                label: 'Independence',
                data: this.modifyArray(this.getWeekDayByRoom('independence', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgb(54, 162, 235)'
              },
              {
                label: 'Blakely',
                data: this.modifyArray(this.getWeekDayByRoom('blakely', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255, 206, 86)',
                backgroundColor: 'rgb(255, 206, 86)'
              },
              {
                label: 'Spooner',
                data: this.modifyArray(this.getWeekDayByRoom('spooner', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)'
              },
              {
                label: 'Green Prairie',
                data: this.modifyArray(this.getWeekDayByRoom('green_prairie', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgb(153, 102, 255)'
              },
              {
                label: 'Pine',
                data: this.modifyArray(this.getWeekDayByRoom('pine', this.inputDay), 6),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgb(255, 159, 64)'
              },
              {
                label: 'Apartments',
                data: this.modifyArray(this.getWeekDayByRoom('the_apartments', this.inputDay), 6),
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
            },
            legend: {
              position: 'right',
              display: window.innerWidth > 500,
            }
          }
        });
      }
    }
  }

  ngOnInit(): void {
    (async () => {
      this.setSelector(0);
      this.loadAllRooms();
      this.loadAllMachines();
      this.loadAllHistory();

      await this.delay(1000); // wait 1s for loading data

      // this.myChart.destroy();
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

  scroll(id: string) {
    this.delay(150).then(() => document.getElementById(id).scrollIntoView());
  }

  hideSelector() {
    document.getElementById('all-rooms').style.bottom = '-50px';
  }

  fakePositions(machines: Machine[]) {
    const w =  5;
    for (let i = 0; i < machines.length;  ++i) {
      machines[i].position.x = i % w * 50;
      machines[i].position.y = Math.floor(i / w) * 50;
      console.log('x' + machines[i].position.x);
      console.log('y' + machines[i].position.y);
    }
  }

  // getX(machine: Machine) {
  //   const x = machine.position.x * 20;
  //   return x + 'px';
  // }

  // getY(machine: Machine) {
  //   const y = machine.position.y * 20;
  //   return y + 'px';
  // }
}

@Component({
  templateUrl: 'home.dialog.html',
})
export class HomeDialog {

  constructor(
    public dialogRef: MatDialogRef<HomeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {machine: Machine}) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
