import {Component, OnInit} from '@angular/core';
import {UserListService} from './user-list.service';
import {User} from './user';
import {Observable} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {AddUserComponent} from './add-user.component';

@Component({
  selector: 'user-list-component',
  templateUrl: 'user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})

export class UserListComponent implements OnInit {
  // These are public so that tests can reference them (.spec.ts)
  public users: User[];
  public filteredUsers: User[];

  // These are the target values used in searching.
  // We should rename them to make that clearer.
  public userName: string;
  public userAge: number;
  public userCompany: string;

  // The ID of the
  private highlightedID: string = '';

  // Inject the UserListService into this component.
  constructor(public userListService: UserListService, public dialog: MatDialog) {

  }

  isHighlighted(user: User): boolean {
    return user._id['$oid'] === this.highlightedID;
  }

  openDialog(): void {
    const newUser: User = {_id: '', name: '', age: -1, company: '', email: ''};
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '500px',
      data: {user: newUser}
    });

    dialogRef.afterClosed().subscribe(newUser => {
      if (newUser != null) {
        this.userListService.addNewUser(newUser).subscribe(
          result => {
            this.highlightedID = result;
            this.refreshUsers();
          },
          err => {
            // This should probably be turned into some sort of meaningful response.
            console.log('There was an error adding the user.');
            console.log('The newUser or dialogResult was ' + newUser);
            console.log('The error was ' + JSON.stringify(err));
          });
      }
    });
  }

  public updateName(newName: string): void {
    this.userName = newName;
    this.updateFilter();
  }

  public updateAge(newAge:number): void {
    this.userAge = newAge;
    this.updateFilter();
  }

  public updateFilter() {
    this.filteredUsers =
      this.userListService.filterUsers(
        this.users,
        this.userName,
        this.userAge
      );
  }

  /**
   * Starts an asynchronous operation to update the users list
   *
   */
  refreshUsers(): Observable<User[]> {
    // Get Users returns an Observable, basically a "promise" that
    // we will get the data from the server.
    //
    // Subscribe waits until the data is fully downloaded, then
    // performs an action on it (the first lambda)

    const users: Observable<User[]> = this.userListService.getUsers();
    users.subscribe(
      users => {
        this.users = users;
        this.updateFilter();
      },
      err => {
        console.log(err);
      });
    return users;
  }

  loadService(): void {
    this.userListService.getUsers(this.userCompany).subscribe(
      users => {
        this.users = users;
        this.filteredUsers = this.users;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    this.refreshUsers();
    this.loadService();
  }
}
