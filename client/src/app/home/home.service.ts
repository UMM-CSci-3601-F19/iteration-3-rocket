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
}
