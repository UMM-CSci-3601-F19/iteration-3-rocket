import {Component, OnInit, Inject} from '@angular/core';
import {Room} from './room';
import {History} from './history';
import {Machine} from './machine';
import {Observable} from 'rxjs';
import {HomeService} from './home.service';

import {CookieService} from 'ngx-cookie-service';

import * as Chart from 'chart.js';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {Subscription} from './subscription';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';


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

  public roomVacant: number;
  public roomRunning: number;
  public roomBroken: number;

  public roomId = '';
  public roomName = 'All rooms';
  public selectorState: number;
  public numOfVacant: number;
  public numOfAll: number;

  public mapWidth: number;
  public mapHeight: number;

  public isSubscribed: boolean;
  public subscriptionDisabled: boolean;

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

  // tslint:disable-next-line:max-line-length
  constructor(public homeService: HomeService, public dialog: MatDialog, public subscription: MatDialog, private cookieService: CookieService) {
    this.subscriptionDisabled = true;
    this.machineListTitle = 'available within all rooms';
    this.brokenMachineListTitle = 'Unavailable machines within all rooms';
  }

  openSubscription(room_id: string) {
    // tslint:disable-next-line:max-line-length
    const outOfWashers = this.machines.filter(m => m.room_id === room_id && m.status === 'normal' && m.type === 'washer' && !m.running).length === 0;
    // tslint:disable-next-line:max-line-length
    const outOfDryers = this.machines.filter(m => m.room_id === room_id && m.status === 'normal' && m.type === 'dryer' && !m.running).length === 0;
    const newSub: Subscription = {email: '', type: '', id: room_id};
    const dialogRef = this.subscription.open(SubscriptionDialog, {
      width: '500px',
      data: {
        subscription: newSub,
        noWasher: outOfWashers,
        noDryer: outOfDryers,
        roomName: this.translateRoomId(this.roomId)
      },
    });


    // tslint:disable-next-line:no-shadowed-variable
    dialogRef.afterClosed().subscribe(newSub => {
      if (newSub != null) {
        console.log(newSub);
        this.homeService.addNewSubscription(newSub).subscribe(
          () => {
            this.rooms.filter(m => m.id === this.roomId)[0].isSubscribed = true;
            this.isSubscribed = true;
            this.subscriptionDisabled = true;
          },
          err => {
            // This should probably be turned into some sort of meaningful response.
            console.log('There was an error adding the subscription.');
            console.log('The newSub or dialogResult was ' + newSub);
            console.log('The error was ' + JSON.stringify(err));
          }
        );
      }
    });
  }

  openDialog(theMachine: Machine) {
    const thisMachine: Machine = {
      id: theMachine.id,
      name: this.translateMachineName(theMachine.name),
      running: theMachine.running,
      status: theMachine.status,
      room_id: this.translateRoomId(theMachine.room_id),
      type: theMachine.type,
      position: theMachine.position,
      remainingTime: theMachine.remainingTime,
      vacantTime: theMachine.vacantTime,
      isSubscribed: theMachine.isSubscribed
    };
    const newSub: Subscription = {email: '', type: 'machine', id: thisMachine.id};
    const dialogRef = this.dialog.open(HomeDialog, {
      width: '330px',
      data: {machine: thisMachine, newMachineSub: newSub},
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      this.machines.filter(m => m.id === thisMachine.id)[0].isSubscribed = thisMachine.isSubscribed;
      this.filteredMachines.filter(m => m.id === thisMachine.id)[0].isSubscribed = thisMachine.isSubscribed;
      console.log(thisMachine.isSubscribed);
      console.log('The dialog was closed');
    });
  }

  public updateCookies(id: string, name: string): void {
    this.cookieService.set('room_id', id);
    this.cookieService.set('room_name', name);
  }

  public defaultSet(name: string): boolean {
    // if (this.cookieService.check('room_id')) {
    //   return this.cookieService.get('room_id') !== '';
    // }
    return this.cookieService.get('room_name') === name;
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
    this.inputDay = this.today.getDay() + 1;
    this.updateMachines();
    this.delay(100).then();
    this.rooms.map(r => {
      if (r.isSubscribed === undefined) {
        r.isSubscribed = false;
      }
    });
    this.roomVacant = this.filteredMachines.filter(m => m.running === false && m.status === 'normal').length;
    this.roomRunning = this.filteredMachines.filter(m => m.running === true && m.status === 'normal').length;
    this.roomBroken = this.filteredMachines.filter(m => m.status === 'broken').length;
    if (this.roomId !== undefined && this.roomId !== '') {
      // tslint:disable-next-line:max-line-length
      const washerVacant = this.machines.filter(m => m.room_id === this.roomId && m.type === 'washer' && m.status === 'normal' && m.running === false).length;
      // tslint:disable-next-line:max-line-length
      const dryerVacant = this.machines.filter(m => m.room_id === this.roomId && m.type === 'dryer' && m.status === 'normal' && m.running === false).length;
      this.isSubscribed = this.rooms.filter(r => r.id === this.roomId)[0].isSubscribed;
      this.subscriptionDisabled = this.isSubscribed || (washerVacant !== 0 && dryerVacant !== 0);
    }
    this.buildChart();
    this.fakePositions();
    this.setSelector(1);
    // document.getElementById('allMachineList').style.display = 'unset';
    document.getElementById('all-rooms').style.bottom = '2%';
    this.scroll('mainBody');
  }

  private updateMachines(): void {
    // console.log(this.inputRoom);
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
    this.inputDay = (+this.inputDay + +num) % 7;
    if (this.inputDay === 0) {
      this.inputDay = 7;
    }
    this.buildChart();
  }


  updateDayBySelector(num: number) {
    this.inputDay = +num;
    this.buildChart();
  }

  getWeekDayByRoom(room, wekd, addition?): number[] {
    const tempWekd: Array<number> = [];
    if (this.history !== undefined) {
      for (let i = 0; i < 48; i++) {
        tempWekd.push(this.history.filter(history => history.room_id === room).pop()[wekd][i]);
      }
      if (addition !== undefined && addition === true) {
        ++wekd;
        if (wekd === 8) {
          wekd = 1;
        }
        for (let i = 0; i < 6; i++) {
          tempWekd.push(this.history.filter(history => history.room_id === room).pop()[wekd][i]);
        }
      }
    }
    return tempWekd;
  }

  modifyArray(arr, num, addition?): number[] {
    const temp: Array<number> = [];
    let i = 0;
    for (; i < 48; i = i + num) {
      let sum = 0;
      for (let j = 0; j < num; j++) {
        sum = sum + arr[j + i];
      }
      temp.push(sum / num);
    }
    if (addition !== undefined && addition === true) {
      for (; i < 54; i = i + num) {
        let sum = 0;
        for (let j = 0; j < num; j++) {
          sum = sum + arr[j + i];
        }
        temp.push(sum / num);
      }
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
    if (this.myChart != null) {
      this.myChart.destroy();
    }
    if (this.history !== undefined) {
      this.canvas = document.getElementById(this.chart);
      this.ctx = this.canvas;

      let xlabel;
      let xlabel2;
      // this.filterGraphData();

      xlabel = ['0a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'];

      xlabel2 = ['0a', '3a', '6a', '9a', '12p', '3p', '6p', '9p', '12a'];

      if (this.inputRoom !== 'all') {
        this.myChart = new Chart(this.ctx, {
          type: 'bar',
          data: {
            labels: xlabel,
            datasets: [{
              data: this.modifyArray(this.getWeekDayByRoom(this.inputRoom, this.inputDay), 2),
              backgroundColor: '#a24d5e'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 8,
                  fontSize: 15,
                  fontColor: 'rgb(150, 150, 150)'
                }
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
                data: this.modifyArray(this.getWeekDayByRoom('gay', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255,99,132)',
                backgroundColor: 'rgb(255,99,132)'
              },
              {
                label: 'Independence',
                data: this.modifyArray(this.getWeekDayByRoom('independence', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgb(54, 162, 235)'
              },
              {
                label: 'Blakely',
                data: this.modifyArray(this.getWeekDayByRoom('blakely', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255, 206, 86)',
                backgroundColor: 'rgb(255, 206, 86)'
              },
              {
                label: 'Spooner',
                data: this.modifyArray(this.getWeekDayByRoom('spooner', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)'
              },
              {
                label: 'Green Prairie',
                data: this.modifyArray(this.getWeekDayByRoom('green_prairie', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgb(153, 102, 255)'
              },
              {
                label: 'Pine',
                data: this.modifyArray(this.getWeekDayByRoom('pine', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgb(255, 159, 64)'
              },
              {
                label: 'Apartments',
                data: this.modifyArray(this.getWeekDayByRoom('the_apartments', this.inputDay, true), 6, true),
                hidden: false,
                fill: false,
                lineTension: 0.2,
                borderColor: 'rgb(100,100,100)',
                backgroundColor: 'rgb(100,100,100)'
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
              enabled: false,
            },
            elements: {
              point: {
                radius: 0
              }
            },
            scales: {
              xAxes: [{
                gridLines: {
                  display: false
                },
                ticks: {
                  fontSize: 15,
                  fontColor: 'rgb(150, 150, 150)'
                }
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
            },
            legend: {
              labels: {
                fontSize: 12,
                fontColor: 'rgb(150, 150, 150)',
              },
              position: 'right',
              display: window.innerWidth > 500,
            }
          },
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

      await this.delay(500); // wait 0.5s for loading data

      if (this.rooms !== undefined && this.machines !== undefined && this.history !== undefined) {
        this.updateMachines();
        this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
        this.updateCounter();
        this.updateTime();
        if (this.cookieService.get('room_id') !== '') {
          this.updateRoom(this.cookieService.get('room_id'), this.cookieService.get('room_name'));
        }
      }

      await this.delay(500); // wait 0.5s for loading data
      if (this.rooms === undefined || this.machines === undefined || this.history === undefined) {
        await this.delay(5000); // loading error retry every 5s
        console.log('Retry');
        this.ngOnInit();
      } else {
        document.getElementById('loadCover').style.display = 'none';
        this.buildChart();
      }
    })();
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
    })();
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  scroll(id: string) {
    this.delay(150).then(() => document.getElementById(id).scrollIntoView());
  }

  hideSelector() {
    document.getElementById('all-rooms').style.bottom = '-50px';
  }

  fakePositions() {
    const w = 5;
    const machines = this.filteredMachines;
    for (let i = 0; i < machines.length; ++i) {
      machines[i].position.x = i % w * 50;
      machines[i].position.y = Math.floor(i / w) * 50;
    }
  }

  translateRoomId(roomId: string): string {
    const room = this.rooms.filter(r => r.id === roomId)[0];
    return room.name;
  }

  translateMachineName(name: string): string {
    while (name.indexOf('-') !== -1) {
      name = name.replace('-', ' ');
    }
    return name;
  }

  public generateCustomLink(machineRoomID: string, machineType: string, machineID: string): string {
    if (machineRoomID === 'the_apartments') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Apartment Community Building (Cube)&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'gay') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Clayton A. Gay&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'green_prairie') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Green Prairie Community&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'pine') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Pine&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'independence') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=David C. Johnson Independence&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'spooner') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Spooner&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'blakely') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Blakely&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
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
  getGridCols() {
    return Math.min(window.innerWidth / 400, 4);
  }

  getGraphCols() {
    return Math.min(window.innerWidth / 680, 2);
  }
}


@Component({
  templateUrl: 'home.dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class HomeDialog {

  constructor(
    public homeService: HomeService,
    public dialogRef: MatDialogRef<HomeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { machine: Machine, newMachineSub: Subscription },
    private fb: FormBuilder) {

    this.ngOnInit();
  }

  addSubForm: FormGroup;

  add_sub_validation_messages = {
    'email': [
      {type: 'email', message: 'Email must be formatted properly'}
    ]
  };

  onNoClick(): void {
    this.dialogRef.close();
  }

  addNewSubscription() {
    if (this.data.newMachineSub != null) {
      this.data.machine.isSubscribed = true;
      this.homeService.addNewSubscription(this.data.newMachineSub).subscribe(
        () => {
          // this.machines.filter(m => m.id === this.data.machine.id)[0].isSubscribed = true;
          // this.updateRoom(this.roomId, this.roomName);
        },
        err => {
          // This should probably be turned into some sort of meaningful response.
          console.log('There was an error adding the subscription.');
          console.log('The newSub or dialogResult was ' + this.data.newMachineSub);
          console.log('The error was ' + JSON.stringify(err));
        }
      );
    }
    this.ngOnInit();
  }

  generateCustomLink(machineRoomID: string, machineType: string, machineID: string): string {
    if (machineRoomID === 'The Apartments') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Apartment Community Building (Cube)&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Gay Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Clayton A. Gay&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Green Prairie Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Green Prairie Community&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Pine Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Pine&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Independence Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=David C. Johnson Independence&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Spooner Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Spooner&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else if (machineRoomID === 'Blakely Hall') {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000002=Blakely&entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    } else {
      // tslint:disable-next-line:max-line-length
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdU04E9Kt5LVv6fVSzgcNQj1YzWtWu8bXGtn7jhEQIsqMyqIg/viewform?entry.1000005=Laundry room&entry.1000010=Resident&entry.1000006=Other&entry.1000007=issue with ' + machineType + ' ' + machineID + ': ';
    }
  }

  createForms() {
    // add user form validations
    this.addSubForm = this.fb.group({
      // We don't need a special validator just for our app here, but there is a default one for email.
      email: new FormControl('email', Validators.email)
    });

    // console.log(this.addSubForm);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.createForms();
  }
}

@Component({
  templateUrl: 'home.subscription.html',
})
// tslint:disable-next-line:component-class-suffix
export class SubscriptionDialog {

  options: FormGroup;
  addSubForm: FormGroup;
  name: string;
  outOfWashers: boolean;
  outOfDryers: boolean;

  constructor(
    public dialogRef: MatDialogRef<SubscriptionDialog>,
    // tslint:disable-next-line:max-line-length
    @Inject(MAT_DIALOG_DATA) public data: { subscription: Subscription, noWasher: boolean, noDryer: boolean, roomName: string }, private fb: FormBuilder) {

    this.outOfWashers = data.noWasher;
    this.outOfDryers = data.noDryer;
    this.name = data.roomName;

    if (this.outOfWashers) {
      data.subscription.type = 'washer';
    } else {
      data.subscription.type = 'dryer';
    }
    // data.subscription.type = 'dryer';

    this.options = fb.group({
      type: data.subscription.type,
    });

    // console.log(this.outOfDryers);
    // console.log(this.outOfWashers);

    this.ngOnInit();
  }

  add_sub_validation_messages = {
    'email': [
      {type: 'email', message: 'Email must be formatted properly'}
    ]
  };

  createForms() {

    // add user form validations
    this.addSubForm = this.fb.group({
      // We don't need a special validator just for our app here, but there is a default one for email.
      email: new FormControl('email', Validators.email)
    });

    // console.log(this.addSubForm);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.createForms();
  }
}
