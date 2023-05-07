import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Bank } from 'src/app/core/models/transaction.models';
import { banksList }    from 'src/app/core/mock/banks';


@Component({
  selector: 'app-bankslist-dialog',
  templateUrl: './bankslist-dialog.component.html',
  styleUrls: ['./bankslist-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BanksListDialogComponent implements OnInit {
  page: number = 0;
  displayedBanks;
  searchText: string;


  likelyBanks:any [];

  constructor(
    public dialogRef: MatDialogRef<BanksListDialogComponent>,
    private transactionService: TransactionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getBankSub: Subscription;
  bankListOnView: Array<Bank> = [];
  loaderIsActive: boolean;
  loaderMsg: string;

  banks: Array<any> = [];

  ngOnInit(): void {
    this.banks = banksList;    // this.loadBankList();
    this.likelyBanks = this.data.likelyBanks;
    if(this.likelyBanks == undefined) {
      this.showMoreBanks();
    }
  }

  showMoreBanks() {
    this.page = 1;
  }

  bankSelect(selectedBank: Bank) {
    this.dialogRef.close(selectedBank);
  }

  private loadBankList(): void {
    if (StorageService.Banks && StorageService.Banks.length > 0) {
      this.banks = this.bankListOnView = StorageService.Banks;
      this.sortedBanks(this.banks);
    } else {
      console.log('in');
      let self = this;
      this.loaderMsg = 'loading banks .. ';
      this.transactionService.getBanks().subscribe(
        (response) => {
          if (
            response.ResponseCode === '00' &&
            response.Banks &&
            response.Banks.length > 0
          ) {
            StorageService.Banks =
              self.banks =
              self.bankListOnView =
                response.Banks;
            this.sortedBanks(this.banks);
          }
        },
        (error: any) => {
          self.loaderIsActive = false;
        }
      );
    }
  }

  filter(array, searchterm) {
    array.array.forEach((element) => {});
  }

  sortedBanks(banklist: Bank[]): Bank[] {
    return banklist.sort((a: Bank, b: Bank) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }
}
