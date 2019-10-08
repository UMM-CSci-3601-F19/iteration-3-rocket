// Imports
import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {UserListComponent} from './users/user-list.component';
import {CompanySummariesComponent} from "./company-summaries/company-summaries.component";

// Route Configuration
export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'users', component: UserListComponent},
  {path: 'company-summaries', component: CompanySummariesComponent}
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);
