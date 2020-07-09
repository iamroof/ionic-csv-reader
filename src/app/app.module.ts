import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { PapaParseModule } from 'ngx-papaparse';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { AppComponent } from './app.component';
import { LoaderComponent } from './loader/loader.component';
import { AppRoutingModule } from './app-routing.module';
import { CorePageModule } from './core/core.module';

@NgModule({
  declarations: [AppComponent, LoaderComponent],
  entryComponents: [LoaderComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, PapaParseModule, CorePageModule],
  providers: [
    StatusBar,
    SplashScreen,
    FileChooser,
    File,
    FilePath,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
