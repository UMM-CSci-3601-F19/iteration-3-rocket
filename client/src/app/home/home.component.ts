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
    this.brokenMachineListTitle = "Unavailable Machines within " + this.roomName;
    this.updateMachines();
    this.setSelector(1);
  }

  updateMachines(): void {
    if (this.roomId == '') {
      this.filteredMachines = this.machines;
    } else {
      this.filteredMachines = this.machines.filter(machine => machine.room_id == this.roomId)
    }
  }

  loadAllMachines(): void {
    const machines: Observable<Machine[]> = this.homeService.getMachines();
    machines.subscribe(
      machines => {
        this.machines = machines;
        this.filteredMachines = machines;
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

  updateStates(): void {
    const machines: Observable<Machine[]> = this.homeService.getMachines();
    machines.subscribe(
      machines => {
        for (let m of this.machines) {
          m.status = machines.filter(machine => machine.id == m.id)[0].status;
        }
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

      this.homeService.updateRunningStatus(this.filteredMachines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.filteredMachines);
      this.updateTime()
    })();
  }

  updateTime(): void {
    (async () => {
      await this.delay(5000); // hold 5s per refresh
      console.log('Refresh');
      this.updateStates();
      this.homeService.updateRunningStatus(this.machines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateTime()
    })();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
