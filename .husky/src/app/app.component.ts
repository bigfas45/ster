import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ResponseCodes } from './core/Enumeration';
import {
  Beneficiary,
  DailyTransferLimits,
} from './core/models/transaction.models';
import { StorageService } from './core/services/storage.service';
import { TransactionService } from './core/services/transaction.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  deviceCookie: string;
  timeZone: string;
  deviceUUID: string;
  isLocalCookie: boolean;
  loaderIsActive: boolean;
  getChargesSub: Subscription;
  beneficiaryListSub: Subscription;
  loadUserLimitSub: any;
  

  transferRoutes = [
    { link: 'transfer/transfers', name: 'Transfers' },
    {
      link: 'transfer/international-transfers',
      name: 'International Transfers',
    },
    { link: 'transfer/beneficiaries', name: 'Beneficiaries' },
  ];

  mobileRoutes = [
    {
      name: 'Transfers',
      subModules: [
        {
          link: 'transfers/transfer-otherbanks',
          name: 'Transfer to Other Banks',
        },
        { link: 'transfers/transfer-self', name: 'Transfer to Self' },
        {
          link: 'transfers/transfer-beneficiairies',
          name: 'Transfer to Beneficiaries',
        },
        { link: 'transfers/transfer-ease', name: 'Transfer to @ease accounts' }
      ],
    },
    {
      name: 'International Transfers',
      subModules: [
        {
          link: 'international-transfers/western-union',
          name: 'Western Union Redemption',
        },
        // {
        //   link: 'international-transfers/mastercard-payment',
        //   name: 'MasterCard Payment',
        // },
      ],
    },
    {
      name: 'Beneficiaries',
      subModules: [
        { link: 'beneficiaries/beneficiary-list', name: 'Beneficiaries' },
        { link: 'beneficiaries/add-beneficiary', name: 'Add Beneficiary' },
      ],
    },
  ];

  constructor(
    private _snackbar: MatSnackBar,
    private snackBar: MatSnackBar,
    private transactionService: TransactionService
  ) {};

  ngOnInit(): void {
    // this.loadBankList();
    // this.setUserInfo();
    // this.getInterBankTransferCharges();
    // this.getUserDailyTransferLimit();
    // this.getBeneficiaries();
  }

  private loadBankList(): void {
    if (StorageService.Banks && StorageService.Banks.length > 0) {
      return;
    } else {
      this.transactionService.getBanks().subscribe(
        (response) => {
          if (
            response.ResponseCode === ResponseCodes.SUCCESS &&
            response.Banks &&
            response.Banks.length > 0
          ) {
            StorageService.Banks = response.Banks;
          }
        },
        (error: any) => {
          this.snackBar.open('Error occured', 'Ok', { duration: 2000 });
        }
      );
    }
  }

  getInterBankTransferCharges() {
    this.getChargesSub = this.transactionService.getTransferCharges().subscribe(
      (response) => {
        if (response.ResponseCode == ResponseCodes.SUCCESS) {
          if (response.Charges && response.Charges.length > 0) {
            StorageService.TransferCharges = response.Charges;
          }
        }
      },
      (error: any) => {}
    );
  }

  getUserDailyTransferLimit() {
    this.loadUserLimitSub = this.transactionService
      .getDailyTransferLimit()
      .subscribe((response) => {
        if (
          response.ResponseCode == ResponseCodes.SUCCESS &&
          response.LimitDataRecords &&
          response.LimitDataRecords.length > 0
        ) {
          StorageService.DailyTransferLimit = new Array<DailyTransferLimits>();

          let usdLimits = response.LimitDataRecords.filter(
            (x) =>
              x.DAILY_LIMIT_AVAILABLE &&
              x.DAILY_LIMIT_AVAILABLE.CURRENCY == 'USD'
          );

          if (usdLimits && usdLimits.length > 0) {
            let newLimit = new DailyTransferLimits();
            newLimit.currency = 'USD';
            newLimit.dailyLimitsAvailable = +(usdLimits[0].DAILY_LIMIT_AVAILABLE
              .AMOUNT as number);
            newLimit.totalDailyLimits = +(usdLimits[0].TOTAL_DAILY_LIMIT
              .AMOUNT as number);
            newLimit.limitApplicable = usdLimits[0].DAILY_LIMIT_APPLICABLE;
            StorageService.DailyTransferLimit.push(newLimit);
          }

          let ngnLimits = response.LimitDataRecords.filter(
            (x) =>
              x.DAILY_LIMIT_AVAILABLE &&
              x.DAILY_LIMIT_AVAILABLE.CURRENCY == 'USD'
          );

          if (ngnLimits && ngnLimits.length > 0) {
            let newLimit = new DailyTransferLimits();
            newLimit.currency = 'NGN';
            newLimit.dailyLimitsAvailable = +(ngnLimits[0].DAILY_LIMIT_AVAILABLE
              .AMOUNT as number);
            newLimit.totalDailyLimits = +(ngnLimits[0].TOTAL_DAILY_LIMIT
              .AMOUNT as number);
            newLimit.limitApplicable = ngnLimits[0].DAILY_LIMIT_APPLICABLE;
            StorageService.DailyTransferLimit.push(newLimit);
          }
        }
      });
  }

  getBeneficiaries() {
    this.beneficiaryListSub = this.transactionService
      .getBeneficiaries()
      .subscribe((response) => {
        if (response.ResponseCode == ResponseCodes.SUCCESS) {
          // StorageService.Benficiaries = this.sortBeneficiaries(response.Beneficiaries);
          StorageService.Benficiaries = response.Beneficiaries;
          console.log(StorageService.Benficiaries);
        }
        if(response.ResponseDescription === 'No records fetched') {
          StorageService.Benficiaries = [];
        }
      });
  }

  setUserInfo() {
    StorageService.UserId = localStorage.getItem('userId');
    StorageService.CifId = JSON.parse(localStorage.getItem('authData')).CifId;
    StorageService.CustomerAccounts = JSON.parse(
      localStorage.getItem('userAccount')
    );
    StorageService.UserDeatils = JSON.parse(localStorage.getItem('authData'))
  }
}
