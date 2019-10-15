import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';

import {Room} from './room';
import {Machine} from "./machine";
import {environment} from '../../environments/environment';

@Injectable()
export class HomeService {
  readonly baseUrl: string = environment.API_URL ;
  private roomURL: string = this.baseUrl + 'rooms';
  private machineURL: string = this.baseUrl + 'machines';

  constructor(private http: HttpClient) {
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.roomURL);
  }

  getMachinesAtRoom(roomId?: string): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.roomURL + "/" + roomId + "/machines");
  }


  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.machineURL);
  }

  getMachine(machineId: string): Observable<Machine> {
    return this.http.get<Machine>(this.machineURL + "/" + machineId);
  }

  updateAvailableMachineNumber(rooms: Room[], machines: Machine[]): void {
    rooms.map(room => {
      room.numberOfAllMachines = machines.filter(machine => machine.room_id == room.id).length;
      room.numberOfAvailableMachines = machines.filter(machine => machine.room_id == room.id).filter(machine => machine.status === "normal" && machine.running === false).length;
    })
  }vacantTime

  updateRunningStatus(machines: Machine[]): void {
    machines.filter(machine => machine.status=="normal").map(machine => {
      if (machine.running == true) {
        if (machine.previousRunningState == null || machine.previousRunningState == false) {
          machine.remainingTime = 60;
          machine.vacantTime = -1;
          machine.previousRunningState = true;
        } else {
          if (machine.remainingTime > 0) {
            --machine.remainingTime;
          }
          machine.vacantTime = -1;
        }
      } else {
        if (machine.previousRunningState == null || machine.previousRunningState == true) {
          machine.remainingTime = -1;
          machine.vacantTime = 0;
          machine.previousRunningState = false;
        } else {
          ++machine.vacantTime;
          machine.remainingTime = -1;
        }
      }
    });
  }
}
