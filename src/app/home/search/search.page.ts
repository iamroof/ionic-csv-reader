import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { EIBService } from '../eib.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  constructor(public modalController:ModalController,
              private formBuilder:FormBuilder, private eibService:EIBService, public toastController: ToastController) { }

  @Input() columns: Array<any>;
  @Input() type: string;
  @Input() searchtext: string;
 
  columnsMap:any;

  
 searchForm:FormGroup;


 @HostListener('document:ionBackButton', ['$event'])
 public async overrideHardwareBackAction($event: any) {
        await this.modalController.dismiss();
    }

  ngOnInit() {

    this.columnsMap = this.eibService.columnMaps;

    this.searchForm = this.formBuilder.group({
      searchType: [this.type, [Validators.required]],
      searchValue: [this.searchtext,  [Validators.required]]
    });

  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Please enter search text',
      duration: 2000
    });
    toast.present();
  }

  clear(){
    this.modalController.dismiss({
      'action': 'clear'
    });
  }

  close(){
    this.modalController.dismiss({
      'action': 'close'
    });
  }

  search(){
    
    if(this.searchForm.value.searchType != "" && this.searchForm.value.searchValue && this.searchForm.value.searchValue.trim() !="")
    { 
      this.modalController.dismiss({
        'action': 'search',
        'type': this.searchForm.value.searchType,
        'searchtext': this.searchForm.value.searchValue
      });
    }else{
      this.presentToast();
    }
    
  }

}