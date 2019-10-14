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
    this.machineListTitle = "Available at All Rooms";
    this.brokenMachineListTitle = "Unavailable Machines";
  }

  setSelector(state: number) {
    this.selectorState = state;
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.machineListTitle = "Available at " + this.roomName;
    this.brokenMachineListTitle = "Unavailable Machines at " + this.roomName;
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

  loadAllMachines(): Observable<Machine[]> {
    const machines: Observable<Machine[]> = this.homeService.getMachines();
    machines.subscribe(
      machines => {
        this.machines = machines;
        this.filteredMachines = machines;
      },
      err => {
        console.log(err);
      });
    return machines;
  }

  loadAllRooms(): Observable<Room[]> {
    const rooms: Observable<Room[]> = this.homeService.getRooms();
    rooms.subscribe(
      rooms => {
        this.rooms = rooms;
      },
      err => {
        console.log(err);
      });
    return rooms;
  }

  ngOnInit(): void {
    (async () => {
      this.setSelector(0);
      this.loadAllRooms();
      this.loadAllMachines();

      await this.delay(2000);

      this.homeService.updateRunningStatus(this.filteredMachines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.filteredMachines);
      this.updateTime()
    })();
  }

  updateTime(): void {
    (async () => {
      await this.delay(1000);

      console.log('Refresh');
      this.homeService.updateRunningStatus(this.filteredMachines);
      this.homeService.updateAvailableMachineNumber(this.rooms, this.machines);
      this.updateTime()
    })();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
