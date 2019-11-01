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
  graphMode = 'bar';
  chart='myChart';
  public inputRoom = "all";
  public history: History[];
  public filteredHistory: History[];

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
/*
  filterGraphData(){
    this.history = this.homeService.get
    if (this.inputRoom === 'all'){
      this.filteredHistory
    } else {
      this.filteredHistory = this.history.filter(history => history.room_id === this.inputRoom);
    }
  }
*/
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

    xlabel = ['0a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a',
      '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p',
      '9p', '10p', '11p']

    this.myChart = new Chart(this.ctx, {
      type: this.graphMode,
      data: {
        labels: xlabel,
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
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
