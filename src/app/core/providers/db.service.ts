import { Injectable } from '@angular/core';
import { forEach, keys, values } from 'lodash';
import { AppTableConstants } from '../constants/app-table.constants';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import _ from "lodash";

declare let window;
declare let cordova;

@Injectable()
export class DBService {
  public db: any;
  public counter: number;
  public tblLenth: any;
  private dbConfig: any = {};

  constructor(private tablesConstants: AppTableConstants,private sqlite: SQLite) {
    this.dbConfig = this.tablesConstants.dbConstants;
  }

  /**
   * Init - init database etc. PS! Have to wait for Platform.ready
   */
  init(): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      self.initDatabase().then(function() {
        console.log("db created");
        self.createAppTables().then(res => {
          console.log("table created");
          resolve('success');
        });
      });
    });
  }

  createAppTables() {
    var self = this;
    return new Promise((resolve, reject) => {
      var tables = self.tablesConstants.tableList;
      var tblLength = Object.keys(tables).length;
      var counter = 0;
      // forEach(tables, function (value) {
      for (var key in tables) {
        self
          .createTable(tables[key].tableName, tables[key].tableFields)
          .then(function(res) {
            counter++;
            if (counter == tblLength) {
              resolve('success');
            }
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  }

  createPlaceholderQuestionmark(fieldNames) {
    return fieldNames
      .map(function() {
        return '?';
      })
      .join(',');
  }

  createUpdateQuery(fieldNames) {
    return fieldNames
      .map(function(fieldName) {
        return fieldName + '=?';
      })
      .join(',');
  }

  whereQuery(fieldNames) {
    return fieldNames
      .map(function(fieldName) {
        return fieldName + '=?';
      })
      .join(' AND ');
  }

  prepareResult(response) {
    var result = [];
    if (response.rows) {
      var len = response.rows.length;
      var i;

      for (i = 0; i < len; i++) {
        result.push(response.rows.item(i));
      }
    }
    return result;
  }

  initDatabase(): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        if (window.openDatabase) {
          //TODO : Websql Used for development purpose, it'll be removed at the time of release.
          this.db = window.openDatabase(
            this.dbConfig.dbName + '.db',
            this.dbConfig.dbVersion,
            this.dbConfig.dbName + ' DB',
            2 * 1024 * 1024
          );
          resolve('success');
        } else {
          reject(
            'Your browser doesnt support WebSQL. Either use chrome or use this wrapper with cordova sqlite plugin'
          );
        }
      } 
      else{
        self.sqlite.create({
          name: this.dbConfig.dbName,
          location: 'default'
        })
        .then((db: SQLiteObject) => {
          console.log("self.db",db);
          self.db = db;
          resolve('success');
        })
        .catch(e => console.log(console.log("error",e)));
      }
    });
  }

  exec(query, params): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      self.db.transaction(function(tx) {
        tx.executeSql(
          query,
          params,
          function(tx, result) {
            resolve(self.prepareResult(result));
          },
          function(tx, error) {
            console.log('Transaction Error: ' + error.message);
            reject(error);
          }
        );
      });
    });
  }

  createTable(tableName, columns): Promise<any> {
    var self = this;
    var query = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (';
    var first = true;
    for (var key in columns) {
      var deflt = columns[key]['default'],
        ref = columns[key].ref;
      var columnDec =
        (first ? ((first = false), '') : ',') +
        key +
        (columns[key].type ? ' ' + columns[key].type : '') +
        (columns[key].primary ? ' PRIMARY KEY' : '') +
        (columns[key].unique ? ' UNIQUE' : '') +
        (columns[key].notnull ? ' NOT NULL' : '') +
        (deflt ? ' DEFAULT ' + deflt : '') +
        (ref ? ' REFERENCES ' + ref : '');
      query += columnDec;
    }
    query += ')';

    return new Promise((resolve, reject) => {
      self.db.transaction(function(tx) {
        tx.executeSql(
          query,
          [],
          function(tx, result) {
            resolve(result);
          },
          function(tx, error) {
            reject(error);
          }
        );
      });
    });
  }

  insertTableData(tableName, tableData): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      var query;
      var fieldNames = keys(tableData);
      var fieldValues = values(tableData);
      query =
        'INSERT INTO ' +
        tableName +
        ' (' +
        fieldNames.join(',') +
        ') ' +
        ' VALUES (' +
        this.createPlaceholderQuestionmark(fieldNames) +
        ')';
      self
        .exec(query, fieldValues)
        .then(function(res) {
          resolve(res);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * Method to get all records
   *
   * @param {String} tableName - Name of table to perform the transaction
   * @returns {Promise} - Returns angularjs promise
   */
  selectAll(
    tableName,
    conditionData?: any,
    orderBy?: Object,
    isNotNull?: boolean
  ): Promise<any> {
    var query;
    var where;
    var keyFieldsValues;
    return new Promise((resolve, reject) => {
      var self = this;
      query = 'SELECT * FROM ' + tableName;

      if (conditionData) {
        where = isNotNull
          ? conditionData.keyFields[0] + ' IS NOT NULL'
          : this.whereQuery(conditionData.keyFields);
        query += ' WHERE ' + where;
        keyFieldsValues = isNotNull ? [] : conditionData.keyValues;
      } else {
        keyFieldsValues = [];
      }
      if (orderBy) {
        let orderByColumn = keys(orderBy);
        let orderBySequence = values(orderBy);
        for (var i = 0; i < orderByColumn.length; i++) {
          query +=
            ' ORDER BY ' +
            orderByColumn[i] +
            ' COLLATE NOCASE ' +
            orderBySequence;
        }
      }/*  else {
        query += ' ORDER BY rowid DESC ';
      } */
      if (conditionData && conditionData.limit)
        query +=
          ' LIMIT ' + conditionData.limit + ' OFFSET ' + conditionData.offset;
      self
        .exec(query, keyFieldsValues)
        .then(function(res) {
          resolve(res);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * Method to delete a record with unique Id
   *
   * @param {Array} fieldNames - Name of fields to perform the transaction
   * @param {Array} fieldValues - Value of fields to perform the transaction including the Id
   * @param {String} tableName - Name of table to perform the transaction
   * @returns {Promise} - Returns angularjs promise
   */
  query(query, fieldValues) {
    var self = this;
    return self.exec(query, fieldValues);
  }

  truncate(tableName, conditionData?: any): Promise<any> {
    var keyFieldsValues;
    var where;
    return new Promise((resolve, reject) => {
      for (let i = 0; i < tableName.length; i++) {
        var self = this;
        var query = 'DELETE FROM ' + tableName[i];
        if (conditionData) {
          where = this.whereQuery(conditionData.keyFields);
          query += ' WHERE ' + where;
          keyFieldsValues = conditionData.keyValues;
        } else {
          keyFieldsValues = [];
        }

        self
          .exec(query, keyFieldsValues)
          .then(function(res) {
            if (i + 1 == tableName.length) resolve(res);
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  }

  drop(tableName): Promise<any> {
    
    var self = this;
    return new Promise((resolve, reject) => {
      
      var query = "DROP TABLE IF EXISTS " + tableName;

        self.exec(query,[])
          .then(function(res) {
            resolve();
          })
          .catch(function(err) {
            reject(err);
          });
      
    });
  }

  upsert(tableName, tableData): Promise<any> {
    var self = this;

    var fieldNames = _.keys(tableData);
    var fieldValues = _.values(tableData);

    var query = 'INSERT OR REPLACE INTO ' + tableName + ' (' + fieldNames.join(',') + ') ' + ' VALUES (' + this.createPlaceholderQuestionmark(fieldNames) + ')';
    return new Promise((resolve, reject) => {
        self.exec(query, fieldValues).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            reject(err);
        });
    });
};

updateTableData(tableName, tableData, keyFields): Promise<any> {
  var self = this;
  return new Promise((resolve, reject) => {
      keyFields = keyFields || [];
      var query;
      var fieldNames = _.keys(tableData);
      var where;
      var valueFieldsValues;
      var keyFieldsValues;
      var fieldValues = [];
      var valueFields = _.difference(fieldNames, keyFields);
      valueFieldsValues = valueFields.map(function (valueField) {
          return tableData[valueField];
      });
      keyFieldsValues = keyFields.map(function (keyField) {
          return tableData[keyField];
      });
      query = 'UPDATE ' + tableName + ' SET ' + this.createUpdateQuery(valueFields);
      if (keyFields.length > 0) {
          fieldValues = _.concat(valueFieldsValues, keyFieldsValues);
          where = this.whereQuery(keyFields);
          query += ' WHERE ' + where;
      } else {
          fieldValues = valueFieldsValues;
      }

      self.exec(query, fieldValues).then(function (res) {
          resolve(res);
      }).catch(function (err) {
          reject(err);
      });
  });
};



}
