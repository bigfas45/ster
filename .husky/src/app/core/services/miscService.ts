import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface TimeData {
  minutes: number;
  seconds: number;
  timer: number;
}

@Injectable({ providedIn: 'root' })
export class MiscService {
  timeValues = new Subject<TimeData>();
  timerInterval: ReturnType<typeof setInterval>;
  constructor(private httpClient: HttpClient) {}

  setTimer() {
    const startTime: number = 4;
    let timer = startTime * 60;
    this.timerInterval = setInterval(() => {
      if (timer == 0) {
        this.clearTimer();
        return;
      }
      timer--;
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      this.timeValues.next({
        minutes: minutes,
        seconds: seconds,
        timer: timer,
      });
    }, 1000);
  }
  clearTimer() {
    clearInterval(this.timerInterval);
  }

  zeroTimer() {}

  getSanitizedAmount(amountEntered: string) {
    let validAmountXter = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
      '.',
    ];

    if (!amountEntered) {
      return amountEntered;
    }

    let amountArray = amountEntered.toString().split('');
    let finalAmount = '';

    for (let cursor = 0; cursor < amountArray.length; cursor++) {
      if (validAmountXter.indexOf(amountArray[cursor]) != -1) {
        if (finalAmount.indexOf('.') != -1) {
          let finalAmountArray = finalAmount.split('.');
          if (finalAmountArray.length == 2 && finalAmountArray[1].length < 2) {
            finalAmount += amountArray[cursor];
          } else if (finalAmountArray.length == 1) {
            finalAmount += amountArray[cursor];
          }
        } else {
          finalAmount += amountArray[cursor];
        }
      }
    }

    return finalAmount;
  }

  downloadFileAsBlob( fileName ): Observable<Blob> {

    const filePath = `../../../assets/${fileName}`;
  
  
  
    console.log(`FilePath -> ${filePath}`);
  
    return (this.httpClient.get(filePath, { responseType: 'blob' }));
  
  }

  generateSessionId() {
    var text = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 7; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  nubanValidator(accountNumber: string, registeredBanks: any): any[] {



    if (!registeredBanks || (registeredBanks && registeredBanks.length < 1)) {
        return [];

    }


    let banks: any[] = [];

    try {
        for (let b of registeredBanks) {
            let accountNumberArray: string[] = (b.code + '' + accountNumber).split('');
            let summation = (
                ((+accountNumberArray[0]) * 3) +
                ((+accountNumberArray[1]) * 7) +
                ((+accountNumberArray[2]) * 3) +
                ((+accountNumberArray[3]) * 3) +
                ((+accountNumberArray[4]) * 7) +
                ((+accountNumberArray[5]) * 3) +
                ((+accountNumberArray[6]) * 3) +
                ((+accountNumberArray[7]) * 7) +
                ((+accountNumberArray[8]) * 3) +
                ((+accountNumberArray[9]) * 3) +
                ((+accountNumberArray[10]) * 7) +
                ((+accountNumberArray[11]) * 3)
            )
            let checkSum = (10 - (summation % 10)) % 10;
            if (checkSum === (+accountNumberArray[12])) {
                banks.push(b);
            }
        }
    } catch (error) {

    }

    return banks;
}


}
