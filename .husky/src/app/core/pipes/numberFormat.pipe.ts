import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class NumberFormatPipe implements PipeTransform {


  transform(value: any): any {
    return value.replace(/\D/g, '')

}

}
