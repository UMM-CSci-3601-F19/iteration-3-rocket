import {Component, OnInit} from '@angular/core';
import {Room} from "./room";
import {Machine} from "./machine";
import {Observable} from 'rxjs';
import {HomeService} from './home.service';

// import {MatDialog} from "@angular/material/dialog";

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{
  public machineListTitle: string;
  public rooms: Room[];
  public machines: Machine[];
  public filteredMachines: Machine[];

  public roomId: string;
  public roomName: string;
  public selectorState: number;

  constructor(public roomService: HomeService) {
    this.machineListTitle = "All Machines";
  }

  setSelect(state: number) {
    this.selectorState = state;
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.machineListTitle = "Machines Available at " + this.roomName;
    this.updateMachines();
    this.setSelect(1);
  }

  updateMachines(): Observable<Machine[]> {
    const machines: Observable<Machine[]> = this.roomService.getMachinesAtRoom(this.roomId);
    machines.subscribe(
      machines => {
        this.filteredMachines = machines;
      },
      err => {
        console.log(err);
      });
    return machines;
  }

  loadAllMachines(): Observable<Machine[]> {
    const machines: Observable<Machine[]> = this.roomService.getMachines();
    machines.subscribe(
      machines => {
        this.machines = machines;
        this.filteredMachines = machines;
        // console.log(machines)
      },
      err => {
        console.log(err);
      });
    return machines;
  }

  loadAllRooms(): Observable<Room[]> {
    const rooms: Observable<Room[]> = this.roomService.getRooms();
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
    this.setSelect(0);
    this.loadAllRooms();
    this.loadAllMachines();
  }
}
