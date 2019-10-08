import {Component} from '@angular/core';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public text: string;

  constructor() {
    this.text = "This is a home page! It doesn't do anything!";
  }
}
