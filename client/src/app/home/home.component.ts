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
  public text: string;
  public rooms: Room[];
  public machines: Machine[];
  public filteredMachines: Machine[];

  public roomId: string;
  public roomName: string;

  constructor(public roomService: HomeService) {
    this.text = "All the machines on the campus:";
  }

  public updateRoom(newId: string, newName: string): void {
    this.roomId = newId;
    this.roomName = newName;
    this.text = "Machines available at: " + this.roomName;
    this.updateMachines();
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
    this.loadAllRooms();
    this.loadAllMachines();
  }
}
