import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {HttpClientModule, HttpClient} from '@angular/common/http';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {UserListComponent} from './users/user-list.component';
import {UserListService} from './users/user-list.service';
import {HomeService} from './home/home.service';
import {Routing} from './app.routes';
import {APP_BASE_HREF} from '@angular/common';

import {CustomModule} from './custom.module';
import {AddUserComponent} from './users/add-user.component';
import {HomeDialog} from './home/home.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material';

import {CookieService} from "ngx-cookie-service";

// import {MDCRipple} from '@material/ripple';

// import {ScrollDispatchModule} from '@angular/cdk/scrolling';
// import {CdkStepperModule} from '@angular/cdk/stepper';
// import {CdkTableModule} from '@angular/cdk/table';
// import {CdkTreeModule} from '@angular/cdk/tree';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    Routing,
    CustomModule,
    MatGridListModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    // MDCRipple,
    // ScrollDispatchModule,
    // CdkStepperModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    UserListComponent,
    AddUserComponent,
    HomeDialog,
  ],
  providers: [
    HttpClient,
    UserListService,
    HomeService,
    CookieService,
    {provide: APP_BASE_HREF, useValue: '/'},
  ],
  entryComponents: [
    AddUserComponent,
    HomeDialog,
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
