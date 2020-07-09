import { Injectable } from '@angular/core';
import {DBService } from '../core/providers/db.service';

const COLUMN_PREFIX: string = "COL";
const ASS_TABLE_NAME: string = "ASSOCIATION";
const EMP_TABLE_NAME: string = "EMPLOYEE";
const GENERAL_TABLE_NAME: string = "GENERAL";

@Injectable()
export class EIBService {

    columnsCount: number;

    columnMaps: any = {};

    constructor(private dbService:DBService){

    }


    importData(hdrData:Array<string>, rowdata:Array<any>):Promise<any>{
        return new Promise((resolve, reject)=>{
            this.dropEmployeeTable().then(()=>{
                this.truncateAssTable().then(()=>{
                
                this.columnsCount = hdrData.length;
                
                    this.createEmployeeTable(hdrData).then(()=>{

                        this.updateEmployeeTable(rowdata).then(()=>{
                            this.updateAssTable(hdrData).then(()=>{
                                
                                let retArr = [];
                                for(let g=1; g < this.columnsCount; g++){
                                    retArr.push(COLUMN_PREFIX+g);
                                    if(g == 4){
                                        break;
                                    }
                                }

                                this.saveDashboardKeys(retArr).then(()=>{
                                    resolve();
                                }, (err)=>{
                                    reject(err);
                                })
                               
                            }, (err)=>{
                                console.log(err);
                                reject(err);
                            })
                        }, (err)=>{
                        console.log(err);
                        reject(err);
                    })

                    }, (err)=>{
                        console.log(err);
                        reject(err);
                    })
                    

                }, (err)=>{
                    console.log(err);
                    reject(err);
                })
            }, (err)=>{
                console.log(err);
                reject(err);
            })
        }) 
    }

    truncateAssTable():Promise<any> {
        return new Promise((resolve,reject)=>{
          this.dbService.truncate([ASS_TABLE_NAME]).then(()=>{
            resolve();
          },()=>{
            reject("Error in truncateAssTable");
          })
          
        })
      }
    
    dropEmployeeTable():Promise<any>{
        return new Promise((resolve,reject)=>{
            this.dbService.drop(EMP_TABLE_NAME).then(()=>{
                resolve();
              },()=>{
                reject("Error in dropEmployeeTable");
              })

        });
    }

    updateAssTable(hdrData:Array<string>):Promise<any>{
        return new Promise((resolve, reject)=>{

            for(let hdrIndex=0; hdrIndex < hdrData.length; hdrIndex++){

                this.dbService.insertTableData(ASS_TABLE_NAME, {id: (hdrIndex+1),columnName: COLUMN_PREFIX+(hdrIndex+1), label:hdrData[hdrIndex]}).then(()=>{
                    if((hdrIndex+1) == hdrData.length){
                        resolve();
                    }
                },()=>{
                    reject("Error in updateAssTable");
                })

            }

        })
    }
    
    createEmployeeTable(hdrData):Promise<any>{
        return new Promise((resolve, reject)=>{  
            let columnsObj = {
                id: {
                    type: 'INTEGER'
                }
            };

            for(let i=0; i < hdrData.length; i++){
                columnsObj[COLUMN_PREFIX + (i+1)] = { type: 'TEXT' };
            }
            
            this.dbService.createTable(EMP_TABLE_NAME, columnsObj).then(()=>{
                resolve();
            }, ()=>{
                reject("Error in createEmployeeTable");
            })
        
        })
    }


    updateEmployeeTable(rowData:Array<any>):Promise<any>{
        return new Promise((resolve, reject)=>{ 

            let dataObj = {};

            for(let k=0; k < rowData.length; k++){

                dataObj = {};

                dataObj['id'] = k+1;

                for(let j=0; j < rowData[k].length; j++){

                    dataObj[ COLUMN_PREFIX+(j+1)] = rowData[k][j];

                }

                this.dbService.insertTableData(EMP_TABLE_NAME, dataObj).then(()=>{
                    if((k+1) == rowData.length){
                        resolve();
                    }
                }, ()=> {
                    reject();
                })

            }


        })
    }

    fetchAllEmployee():Promise<any>{
        return new Promise((resolve, reject)=>{
            try{
            this.dbService.selectAll(EMP_TABLE_NAME, null, {id: "ASC"}).then((data)=>{
                resolve(data);
            }, (err)=>{
                reject("Error in fetchAllEmployee");
            })
        }
        catch(e){
            reject("Error");
        }
        })
    }

    fetchColumnMaps():Promise<any>{
        return new Promise((resolve, reject)=>{
            this.dbService.selectAll(ASS_TABLE_NAME, null, {id: "ASC"}).then((data)=>{
                resolve(data);
            }, (err)=>{
                reject("Error in fetchColumnMaps");
            })
        })
    }

    setColumnLabels(columnsObj:Array<any>):Promise<any>{
        return new Promise((resolve, reject)=>{
            try{
            let obj = {};
            for(let m=0; m< columnsObj.length; m++){
                obj[columnsObj[m].columnName] = columnsObj[m].label;
            }

            this.columnMaps = obj;
            resolve();
        }
        catch(e){
            reject("Error in setColumnLabels");
        }
        })
    }

    getAllEmployee():Promise<any>{
        return new Promise((resolve, reject)=>{ 

            this.fetchColumnMaps().then((data)=>{
                this.setColumnLabels(data).then(()=>{
                    this.fetchAllEmployee().then((data)=>{
                        resolve(data);
                    }, (err)=>{
                 console.log(err);
                 reject(err);
             })
                }, (err)=>{
                 console.log(err);
                 reject(err);
             })
             }, (err)=>{
                 console.log(err);
                 reject(err);
             })

        })}
    

    getMatches(stype, stext):Promise<any>{
        return new Promise((resolve, reject)=>{ 

            let query = "";
            if(stype != "General"){

                query = "SELECT * FROM "+EMP_TABLE_NAME+ " WHERE " + stype + " LIKE '%" + stext.trim() +"%'";

                
            }
            else{
                query = "SELECT * FROM "+EMP_TABLE_NAME+ " WHERE ";

                let ks = Object.keys(this.columnMaps);
                for(let r=0; r<ks.length; r++){

                    if((r+1) == ks.length){
                        query = query + ks[r] + " LIKE '%" + stext.trim() +"%'";
                    }else{
                    query = query + ks[r] + " LIKE '%" + stext.trim() +"%' or ";
                    }
                }
            }
            console.log(query);
            this.dbService.exec(query,[]).then((res)=>{
                resolve(res);
            }, (err)=>{
                reject(err);
            })

        });
    
    
    }


    saveDashboardKeys(data: Array<string>):Promise<any>{
        return new Promise((resolve, reject)=>{
                let val = data.join("@");
                let dataObj = {
                    key: "DASHBOARDCOLUMNS",
                    value: val
                }

                this.dbService.truncate([GENERAL_TABLE_NAME]).then(()=>{
                    this.dbService.insertTableData(GENERAL_TABLE_NAME, dataObj).then(()=>{
                        resolve();
                }, ()=> {
                    reject("Error in saveDashboardKeys");
                })
                },(err)=>{
                    reject("Error in saveDashboardKeys");
                })
               
        });
    }

    getDashboardConfig():Promise<any>{
        return new Promise((resolve, reject)=>{ 
            let conditionData = {
                'keyFields': ['key'],
                'keyValues': ['DASHBOARDCOLUMNS']
              }
            this.dbService.selectAll(GENERAL_TABLE_NAME, conditionData).then((resp)=>{
                resolve(resp[0]);
            }, ()=>{
                console.log("Error in getDashboardConfig")
                reject("Error in getDashboardConfig");
            })

        });
    }
}