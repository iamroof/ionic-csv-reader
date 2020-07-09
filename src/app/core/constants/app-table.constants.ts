import {Injectable } from '@angular/core';

@Injectable()
export class AppTableConstants {
  tables: Object = {};
  dbConstantsVal: Object = {};

  constructor() {
    this.dbConstantsVal = {
      "dbVersion": "1",
      "dbName": "cateib"
    };

    this.tables = {
      generalTable:
      {
        tableName: "GENERAL",
        tableFields: {
          key: {
            type: 'TEXT'
          },
          value: {
            type: 'TEXT'
          },
          
        }
      },
      associationTable:
      {
        tableName: "ASSOCIATION",
        tableFields: {
          id: {
            type: 'INTEGER'
          },
          columnName: {
            type: 'TEXT'
          },
          label: {
            type: 'TEXT'
          },
          
        }
      }
    }
  }

  get tableList() {
    return this.tables;
  }

  get dbConstants() {
    return this.dbConstantsVal;
  }

}
