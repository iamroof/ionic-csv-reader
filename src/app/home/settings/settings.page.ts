import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { EIBService } from '../eib.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SetingsPage implements OnInit {

  constructor(public modalController:ModalController, private eibService:EIBService,private formBuilder:FormBuilder, public toastController: ToastController) { }


  @Input()
  selectedVals:Array<string> = [];

  settingsForm:FormGroup;
  columnsMap:any;
  activeColumns:Array<any> = [];

 items: Array<{desc:string, isChecked:boolean, key: string}> = [];

 @HostListener('document:ionBackButton', ['$event'])
    public async overrideHardwareBackAction($event: any) {
        await this.modalController.dismiss();
    }

    ngOnInit(){

      this.columnsMap = this.eibService.columnMaps;
      this.activeColumns = Object.keys(this.eibService.columnMaps);

      for(const element of this.activeColumns){
          
          this.items.push({desc:this.columnsMap[element], key: element,isChecked: (this.selectedVals.indexOf(element) >= 0)? true: false});
        
      }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Atleast select one',
      duration: 2000
    });
    toast.present();
  }

  save(){

      this.selectedVals = [];
      for(let t=0; t<this.items.length; t++){

          if(this.items[t].isChecked){
              this.selectedVals.push(this.items[t].key);
          }
        
      }

if(this.selectedVals.length > 0){
  this.modalController.dismiss({
    'action': 'save',
    'selectedVals' : this.selectedVals
  });
}else{
  this.presentToast();
}

 

  }

  close(){
      this.modalController.dismiss({
          'action': 'cancel'
        });
  
      }
}