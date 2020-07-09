import { Component, OnInit } from "@angular/core";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { File } from "@ionic-native/file/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { Papa } from "ngx-papaparse";
import { EIBService } from './eib.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SearchPage} from './search/search.page';
import { EmployeePage } from './employee/employee.page';
import { SetingsPage } from './settings/settings.page';

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  private promise: Promise<string>;

  empData: Array<any> = [];

  defCol = ["COL1", "COL2"];

  visibleColumns = ["COL1", "COL2", "COL3", "COL4"];

  searchForm:FormGroup;

  availableColumns: Array<any> = [];

  columnsMap: any = {};

  loading:boolean = false;

  filter: boolean = false;

  lastSearchType: string = "";
  lastSearchText: string = "";

  constructor(
    private fileChooser: FileChooser,
    private file: File,
    private filePath: FilePath,
    private papa: Papa,
    private eibService:EIBService,
    public modalController: ModalController
  ) {}

  ngOnInit(){
  
    this.loading = true;

      this.eibService.getAllEmployee().then((empData)=>{

        this.eibService.getDashboardConfig().then((data)=>{
          try{
            this.visibleColumns = data.value.split("@");
          }  catch(e){
            this.visibleColumns = this.defCol;
          }
          this.alignData(empData);
          this.loading = false;
        }, (err)=> {
          this.visibleColumns = this.defCol;
          this.alignData(empData);
          this.loading = false;
        })
       
      },(err)=>{
        this.loading = false;
      })
  }


  alignData(empData){
    this.columnsMap = this.eibService.columnMaps;
    this.availableColumns = ["General"].concat(Object.keys(this.eibService.columnMaps));
    this.empData = empData;
  }


  importFile() {
    this.fileChooser
      .open()
      .then((uri) => {
        this.filePath.resolveNativePath(uri).then((path) => {
  
          let directoryPath = path.substr(0, path.lastIndexOf("/"));
          let fileName = path.split("\\").pop().split("/").pop();

          this.readFile(directoryPath, fileName);
        });
      })
      .catch((e) => console.log(e));
  }

  async readFile(directory, fileName) {
    this.promise = this.file.readAsText(directory, fileName);
    await this.promise.then((value) => {
      console.log(value);
      this.papa.parse(value, {
        complete: (parsedData) => {
          let headerRow = parsedData.data.splice(0, 1)[0];
          let csvData = parsedData.data;
          console.log(headerRow);
          console.log(csvData);
          this.processData(headerRow, csvData);
        },
      });
    });
  }

  async presentSettingsModal(){

    const settingsModal = await this.modalController.create({
      component: SetingsPage,
      backdropDismiss: false,
      componentProps: {
        'selectedVals': this.visibleColumns
      }
    });

    settingsModal.onWillDismiss().then((resp)=>{

      switch(resp.data['action']){

        case "save":

        this.visibleColumns = resp.data['selectedVals'];
        
        this.eibService.saveDashboardKeys(this.visibleColumns);


          break;
      
          case "close":
          break;
      }
    })
    
    return await settingsModal.present();

  }


  async presentEmpModal(emp:any) {

    const empModal = await this.modalController.create({
      component: EmployeePage,
      backdropDismiss: false,
      componentProps: {
        'employee': emp
        
      }
    });
    
    return await empModal.present();
  }

  async presentSearchModal() {

    const searchModal = await this.modalController.create({
      component: SearchPage,
      backdropDismiss: false,
      componentProps: {
        'columns': this.availableColumns,
        'type': (this.lastSearchType == "") ? "General" : this.lastSearchType,
        'searchtext': this.lastSearchText
      }
    });

    searchModal.onWillDismiss().then((resp)=>{

      switch(resp.data['action']){

        case "search":

        this.lastSearchText = resp.data['searchtext'];
        this.lastSearchType = resp.data['type'];

        this.loading = true;
        this.eibService.getMatches(this.lastSearchType, this.lastSearchText).then((data)=>{
          this.empData = data;
          this.loading = false;
          this.filter = true;
        }, (err)=>{
          console.log(err);
          this.loading = false;
        })


          break;
        
          case "clear":

            this.lastSearchText = "";
            this.lastSearchType = "";
            this.loading = true;
            this.filter = false;
            this.eibService.getAllEmployee().then((empData)=>{
              this.loading = false;
              this.columnsMap = this.eibService.columnMaps;
              this.availableColumns = ["General"].concat(Object.keys(this.eibService.columnMaps));
              this.empData = empData;
            },()=>{
              this.loading = false;
            })



          break;

          case "close":
          break;
      }
    })
    
    return await searchModal.present();
  }

processData(hdrData, rowData){
  
  this.loading = true;

  var newArr = rowData.filter(function(obj){

    return !(obj.length == 1 &&  (obj[0] == null ||  obj[0] == undefined || obj[0].trim() == ""));
    
  });

    this.eibService.importData(hdrData, newArr).then(()=>{
      console.log("Data uploaded successfully");
      this.eibService.getAllEmployee().then((empData)=>{

        this.eibService.getDashboardConfig().then((data)=>{
          try{
            this.visibleColumns = data.value.split("@");
          }  catch(e){
            this.visibleColumns = this.defCol;
          }
          this.alignData(empData);
          this.loading = false;
          this.filter = false;
        }, (err)=> {
          this.visibleColumns = this.defCol;
          this.alignData(empData);
          this.loading = false;
          this.filter = false;
        })
       
      },(err)=>{
        this.loading = false;
        this.filter = false;
      })
    }, (err)=>{
      console.log(err);
    })
}

}
