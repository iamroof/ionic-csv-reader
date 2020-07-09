import { Pipe, PipeTransform } from '@angular/core';

import { EIBService } from './eib.service';

@Pipe({ name: 'empProperty' })

export class EmpProperty implements PipeTransform {

    constructor(public eibService: EIBService) {

    }

  transform(propKey: string) {
    return this.eibService.columnMaps[propKey];
  }
}

