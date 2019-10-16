import {Component, OnInit} from '@angular/core';
import {Room} from "./room";
import {Machine} from "./machine";
import {Observable} from 'rxjs';
import {HomeService} from './home.service';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{
  public machineListTitle: string;
  public brokenMachineListTitle: string;
  public rooms: Room[];
  public machines: Machine[];
  public filteredMachines: Machine[];
  public numOfBroken: number;

  public roomId: string;
  public roomName: string;
  public selectorState: number;

  constructor(public homeService: HomeService) {
    this.machineListTitle = "available within all rooms";
    this.brokenMachineListTitle = "Unavailable machines within all rooms";
  }

  setSelector(state: number) {
    this.selectorState = state;
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.machineListTitle = "available within " + this.roomName;
    this.brokenMachineListTitle = "Unavailable machines within " + this.roomName;
    this.updateMachines();
    this.setSelector(1);
  }

  updateMachines(): void {
    if (this.roomId == null || this.roomId == '') {
      this.filteredMachines = this.machines;
    } else {
      this.filteredMachines = this.machines.filter(machine => machine.room_id == this.roomId)
    }
    this.homeService.updateRunningStatus(this.filteredMachines, this.machines);
    this.numOfBroken = this.filteredMachines.filter(m => m.status === 'broken').length;
  }

  loadAllMachines(): void {
    const machines: Observable<Machine[]> = this.homeService.getMachines();
    machines.subscribe(
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
      rooms => {
        this.rooms = rooms;
      },
      err => {
        console.log(err);
      });
  }

  ngOnInit(): void {
    (async () => {
      this.setSelector(0);
      this.loadAllRooms();
      this.loadAllMachines();

      await this.delay(1000); // wait 1s for loading data

      this.updateMachines();
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateTime()
    })();
  }

  updateTime(): void {
    (async () => {
      await this.delay(10000); // hold 10s for the next refresh
      console.log('Refresh');
      this.loadAllMachines();
      this.homeService.updateRunningStatus(this.filteredMachines, this.machines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateTime()
    }) ();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
