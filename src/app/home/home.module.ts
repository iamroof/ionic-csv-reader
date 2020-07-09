import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import {EIBService } from './eib.service';

import { EmpProperty } from './emp-property.pipe';
import {  ReactiveFormsModule } from '@angular/forms';
import {SearchPage } from './search/search.page';
import {EmployeePage } from './employee/employee.page';
import {SetingsPage } from './settings/settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  entryComponents: [SearchPage, EmployeePage, SetingsPage],
  declarations: [HomePage, EmpProperty, SearchPage, EmployeePage, SetingsPage],
  providers:[EIBService, EmpProperty]
})
export class HomePageModule {}
