import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { EIBService } from '../eib.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.page.html',
  styleUrls: ['./employee.page.scss'],
})
export class EmployeePage implements OnInit {

  constructor(public modalController:ModalController, private eibService:EIBService, public toastController: ToastController) { }

  @Input() employee: Array<any>;

 
  columnsMap:any;
  activeColumns:Array<any> = [];

 @HostListener('document:ionBackButton', ['$event'])
 public async overrideHardwareBackAction($event: any) {
        await this.modalController.dismiss();
    }

  ngOnInit() {

    this.columnsMap = this.eibService.columnMaps;
    this.activeColumns = Object.keys(this.eibService.columnMaps);

  }

  
  close(){
    this.modalController.dismiss({
      'action': 'close'
    });
  }

}