import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { IonicModule } from '@ionic/angular';


import { CorePage } from './core.page';

import { DBService } from './providers/db.service';
import { AppTableConstants } from './constants/app-table.constants';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [CorePage],
  providers: [DBService, AppTableConstants, SQLite]
})
export class CorePageModule {}
