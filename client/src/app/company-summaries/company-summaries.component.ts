import { Component, OnInit } from '@angular/core';
import {CompanySummary} from "../company-summary";
import {User} from "../users/user";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-company-summaries',
  templateUrl: './company-summaries.component.html',
  styleUrls: ['./company-summaries.component.css']
})
export class CompanySummariesComponent implements OnInit {
  readonly summaryUrl: string = environment.API_URL + 'userSummary';

  public summaries: CompanySummary[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getSummaries();
  }

  private getSummaries() {
    let serverResponse : Observable<CompanySummary[]> = this.http.get<CompanySummary[]>(this.summaryUrl);
    serverResponse.subscribe(
      summaries => {
        this.summaries = summaries;
      },
      err => {
        console.log(err);
      });
  }
}
