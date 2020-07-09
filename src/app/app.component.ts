import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';

import { DBService } from '../app/core/providers/db.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dbService:DBService,
    private router: Router,
  ) {

    this.platform.ready().then(() => {
      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();
      this.initializeApp();
    });

    
  }

  initializeApp() {
    this.dbService.init().then(()=>{
      console.log("db created");
      this.router.navigate(['/home']);
    })
  }
}
