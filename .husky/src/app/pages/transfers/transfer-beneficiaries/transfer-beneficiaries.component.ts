import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import {
  Beneficiary,
  CustomerAccount,
  DailyTransferLimits,
  TransferRequestPayload,
} from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BanksListDialogComponent } from 'src/app/shared/bankslist-dialog/bankslist-dialog.component';
import { CategoryDialogComponent } from 'src/app/shared/category-dialog/category-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';
import { beneficiaries } from 'src/app/core/mock/beneficiaries';

@Component({
  selector: 'app-transfer-beneficiaries',
  templateUrl: './transfer-beneficiaries.component.html',
  styleUrls: ['./transfer-beneficiaries.component.scss'],
})
export class TransferBeneficiariesComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  otpSendClicked: boolean = false;

  beneficiaryTransferForm: FormGroup;

  selectedAccount: CustomerAccount;

  selectedBeneficiary: any;

  // beneficiaries: { name: string; bank: string; account: string }[];
  beneficiaries: any[];
  reducedBeneficiariesList: any[];
  withinDailyLimit: boolean;
  accountList: CustomerAccount[];
  availableBalance: number;
  transactionCurrency: string;
  initiateOTPSub: Subscription;
  showCharges: boolean = false;
  insufficientFund: boolean;
  insufficientFundTimer: any;
  tranAmount: number;
  displayedTotal: string;
  isRecurrentPayment: boolean = false;

  
  notificationType: string;
  maskedOtpAddress: string;
  dailyTransferLimits: DailyTransferLimits;
  loaderIsActive: boolean;
  transferSuccessful: boolean;
  transferMessage: string;

  hwtForm: FormGroup;
  isCustomerHWTEnabled: boolean;

  otpReference: string;
  exceptionMessage: string;

  otherBankCharges: number = 0;

  availableLimit: number;
  amountUtilizedFromLimit: number;
  loaderMsg: string;

  tranId: string;
  deviceCookie: string;
  deviceUUID: string;
  timeZone: string;
  isLocalCookie: boolean;

  selectedBank: string;
  selectedCategory: string;
  amountValue: string;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;
  timerSubscription: Subscription;
  beneficiaryListSub: Subscription;
  isVbBank: boolean = false;
  transferDate: string;

  // networks = [
  //   { image: 'images/glo.png', name: 'Glo' },
  //   { image: 'images/mtn.png', name: 'Mtn' },
  //   { image: 'images/9-mobile.png', name: '9mobile' },
  //   { image: 'images/airtel.png', name: 'Airtel' },
  // ];

  constructor(
    public dialog: MatDialog,
    private miscService: MiscService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.beneficiaryTransferForm = new FormGroup({
      'debited-account': new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      beneficiary: new FormControl(null, [Validators.required]),
      'transaction-category': new FormControl(null),
      narration: new FormControl(null, [Validators.required]),
    });
    this.page = 'form';
    
    this.accountList = mockAccounts;
    this.beneficiaries = beneficiaries;

    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });
  }


  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }
  
  onAccountSelect(index: number) {
    this.selectedAccount = this.accountList[index];
    this.beneficiaryTransferForm
      .get('debited-account')
      .setValue(this.selectedAccount.accountNumber);
    this.availableBalance = this.selectedAccount.availableBalance;
    this.transactionCurrency = this.selectedAccount.currency.toUpperCase();
  }

  onBeneficairySelect(index: number) {
    this.selectedBeneficiary = beneficiaries[index];
    this.beneficiaryTransferForm
      .get('beneficiary')
      .setValue(this.selectedBeneficiary.beneficiaryName);

    // if (this.selectedBeneficiary.beneficiaryBankCode != '221') {
    //   this.showCharges = true;
    //   let amountEntered = this.beneficiaryTransferForm.controls['amount'].value;
    //   if (amountEntered) {
    //     if ((amountEntered as string).indexOf('.00') != -1) {
    //       amountEntered = (amountEntered as string).replace('.00', '');
    //     }
    //     amountEntered = amountEntered.replace(/,/g, ''
    //     ); //remove all commas
    //   }
    //   amountEntered = +amountEntered;

    //   this.computeTransferCharges(amountEntered);
    //   this.computeTotalAmount();
    // } else {
    //   this.showCharges = false;
    //   this.otherBankCharges = 0;
    // }
    this.revalidateAmount();
    // if (this.selectedBeneficiary.beneficiaryBankCode.toLowerCase() == '304') {
    //   this.isVbBank = true;
    // }
  }

  
  onBeneficairyIconSelect(beneficiary) {
    this.selectedBeneficiary = beneficiary;
    this.beneficiaryTransferForm
      .get('beneficiary')
      .setValue(this.selectedBeneficiary.beneficiaryName);

    if (this.selectedBeneficiary.beneficiaryBankCode != '221') {
      this.showCharges = true;
      let amountEntered = this.beneficiaryTransferForm.controls['amount'].value;
      if (amountEntered) {
        if ((amountEntered as string).indexOf('.00') != -1) {
          amountEntered = (amountEntered as string).replace('.00', '');
        }
        amountEntered = amountEntered.replace(/,/g, ''); //remove all commas
      }
      amountEntered = +amountEntered;

      this.computeTransferCharges(amountEntered);
      this.computeTotalAmount();
    } else {
      this.showCharges = false;
      this.otherBankCharges = 0;
    }
    this.revalidateAmount();
    if (this.selectedBeneficiary.beneficiaryBankCode.toLowerCase() == '304') {
      this.isVbBank = true;
    }
  }

  commaFormat(event) {
    if (event.which >= 37 && event.which <= 40) return;
    // format number
    if (this.amountValue) {
      const removeComma = this.amountValue.replace(/\,/g, '');
      console.log(removeComma)
      const validNumber = +removeComma;
      this.amountValue = validNumber.toString()
        .replace(/\D/g, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  numberCheck(args) {
    if (args.key === 'e' || args.key === '+' || args.key === '-') {
      return false;
    } else {
      setTimeout(() => {
        this.revalidateAmount();
        this.computeTotalAmount();
      }, 1000);
      return true;
    }
  }

  revalidateAmount() {
    let amountValid = true;
    let amount = this.getTotalAmount();

    if (amount > this.availableBalance) {
      this.insufficientFund = true;
      amountValid = false;

      clearTimeout(this.insufficientFundTimer);

      this.insufficientFundTimer = setTimeout(() => {
        this.snackBar.open('You have an insufficient balance.', 'OK', {
          duration: 1000,
        });
      }, 1000);
    } else {
      this.insufficientFund = false;
    }

    if (
      this.dailyTransferLimits &&
      this.dailyTransferLimits.limitApplicable.toLowerCase() == 'y'
    ) {
      this.availableLimit = +this.dailyTransferLimits.totalDailyLimits;

      this.amountUtilizedFromLimit =
        +this.dailyTransferLimits.totalDailyLimits -
        +this.dailyTransferLimits.dailyLimitsAvailable;

      let amountWithoutCharges = this.getTotalAmountWithoutCharges();

      if (
        amountWithoutCharges > +this.dailyTransferLimits.dailyLimitsAvailable
      ) {
        this.withinDailyLimit = false;
        amountValid = false;
      } else {
        this.withinDailyLimit = true;
      }
    } else {
      this.withinDailyLimit = true;
    }

    return amountValid;
  }

  getTotalAmountWithoutCharges() {
    let amountEntered = this.beneficiaryTransferForm.get('amount').value;

    if (amountEntered) {
      //remove .00 if exist
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    return +amountEntered;
  }

  getTotalAmount() {
    let amountEntered = this.beneficiaryTransferForm.controls['amount'].value;

    if (amountEntered) {
      //remove .00 if exist
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    amountEntered = +amountEntered;

    if (this.showCharges && amountEntered > 0) {
      return +amountEntered + +this.otherBankCharges;
    } else {
      return +amountEntered;
    }

    return amountEntered;
  }

  computeTotalAmount() {
    let amount = 0.0;

    // Only allow digits on amount alone.
    if (this.beneficiaryTransferForm.controls['amount']) {
      let amountEntered = this.beneficiaryTransferForm.controls['amount'].value;

      amountEntered = this.miscService.getSanitizedAmount(amountEntered);
      amount = parseFloat(amountEntered);

      if (this.showCharges && amount > 0) {
        this.computeTransferCharges(amount);

        this.tranAmount = this.getTotalAmount();
      } else if (!this.showCharges && amount > 0) {
        this.tranAmount = amountEntered;
      }
    }
  }

  computeTransferCharges(amount: number) {
    if (
      StorageService.TransferCharges &&
      StorageService.TransferCharges.length > 0
    ) {
      for (let chargeObj of StorageService.TransferCharges) {
        if (chargeObj.StartAmount >= 0 && chargeObj.EndAmount > 0) {
          if (
            amount >= chargeObj.StartAmount &&
            amount <= chargeObj.EndAmount
          ) {
            this.otherBankCharges = chargeObj.Charges;
            break;
          }
        } else if (chargeObj.StartAmount >= 0) {
          if (amount >= chargeObj.StartAmount) {
            this.otherBankCharges = chargeObj.Charges;
            break;
          }
        }
      }

      return StorageService.TransferCharges[
        StorageService.TransferCharges.length - 1
      ].Charges;
    }

    return 0;
  }

  sendOtp(event, status) {
    // this.snackBar.open(
    //   `Please enter the One Time Code sent to you
    //     `,
    //              'OK',
    //        { duration: 2000 }
    //            );
    this.otpSendClicked = true;

    if (this.beneficiaryTransferForm.invalid) {
      return;
    }


    if (status == 'resend') {

      this.snackBar.open(
        `Please enter the One Time Code sent to you
          `,
                   'OK',
             { duration: 2000 }
                 );
    }
    if (this.tranAmount > this.availableBalance) {
      this.snackBar.open('You have an insufficient balance.', 'OK', {
        duration: 1000,
      });
      return;
    }

    this.page = 'otp';
              let seperatedNums = this.tranAmount.toString().split('.');
              this.displayedTotal =
                seperatedNums[0]
                  .replace(/\D/g, '')
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                (seperatedNums[1] ? '.' + seperatedNums[1] : '');
              this.miscService.clearTimer();
              this.miscService.setTimer();
              this.timerSubscription = this.miscService.timeValues.subscribe(
                (timeData) => {
                  this.minutes = timeData.minutes;
                  this.seconds = timeData.seconds;
                  this.timer = timeData.timer;
                }
              );
              this.snackBar.open(
                `Please enter the One Time Code sent to you
                  `,
                           'OK',
                     { duration: 2000 }
                         );

    // if (this.isCustomerHWTEnabled) {
    //   this.page = 'hwt';
    //   return;
    // } else {
    //   this.loaderIsActive = true;
    //   this.initiateOTPSub = this.transactionService
    //     .initiateOtpRequest({
    //       UserId: StorageService.UserId,
    //       CifId: StorageService.CifId,
    //       ReasonCode: '05',
    //     })
    //     .subscribe(
    //       (response) => {
    //         //this.loaderIsActive = false;

    //         if (
    //           response.ResponseCode &&
    //           response.ResponseCode === ResponseCodes.SUCCESS
    //         ) {
    //           this.page = 'otp';
    //           let seperatedNums = this.tranAmount.toString().split('.');
    //           this.displayedTotal =
    //             seperatedNums[0]
    //               .replace(/\D/g, '')
    //               .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    //             (seperatedNums[1] ? '.' + seperatedNums[1] : '');
    //           this.miscService.clearTimer();
    //           this.miscService.setTimer();
    //           this.timerSubscription = this.miscService.timeValues.subscribe(
    //             (timeData) => {
    //               this.minutes = timeData.minutes;
    //               this.seconds = timeData.seconds;
    //               this.timer = timeData.timer;
    //             }
    //           );

    //           this.otpReference = response.ResponseDescription;
    //           this.notificationType = response.NotificationType;
    //           this.maskedOtpAddress = response.NotificationAddress;

    //           this.snackBar.open(
    //             `Please enter the One Time Code sent to ${response.NotificationAddress}
    //   `,
    //             'OK',
    //             { duration: 2000 }
    //           );

    //           return;
    //         }

    //         this.exceptionMessage = response.ResponseFriendlyMessage;
    //       },
    //       (error: any) => {
    //         this.loaderIsActive = false;
    //         if (error && error.status != 401) {
    //           this.exceptionMessage =
    //             'Your request cannot be completed at the moment due to a technical error, please try again later.';
    //         }
    //       }
    //     );
    // }
  }
  onClearForm() {
    this.beneficiaryTransferForm.reset();
    this.selectedAccount = null;
    this.selectedBeneficiary = null;
    this.selectedCategory = null;
    this.otpSendClicked = false;
  }

  categorySelect() {
    const catDialogSub = this.dialog.open(CategoryDialogComponent, {
      data: { selectedCat: '' },
      disableClose: true,
      backdropClass: 'blurred',
    });
    catDialogSub.afterClosed().subscribe((response) => {
      if (response) {
        this.selectedCategory = response;
        this.beneficiaryTransferForm
          .get('transaction-category')
          .setValue(this.selectedCategory);
      }
    });
  }

  onSubmit() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;
    this.transferSuccessful = false;
    this.transferMessage = '';
    let self = this;
    let resolvedTimezoneSettings = Intl.DateTimeFormat().resolvedOptions();

 const successDetail = `Transaction Successful`;
    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: {
        successTitle: successDetail,
        message: `N${this.amountValue} successfully sent `,
        icon: 'done',
        description: 'success',
      },
      backdropClass: 'blurred',
    });
    successDialogSub.afterClosed().subscribe(() => {
      this.onClearForm();
      this.page = 'form';
    });
    //this.tranId = this.miscService.generateSessionId();
    // let payload = {
    //   amount: this.getTotalAmountWithoutCharges(),

    //   customerReference: this.beneficiaryTransferForm.get('narration').value,
    //   beneficiaryReference: this.beneficiaryTransferForm.get('narration').value,

    //   transferDate: moment(new Date()).format('YYYY-MM-DD'),
    //   destinationAccountName: this.selectedBeneficiary.beneficiaryName
    //     ? this.selectedBeneficiary.beneficiaryName
    //     : '',
    //   destinationAccountNo: this.selectedBeneficiary.beneficiaryAccountNumber,

    //   destinationBankCode: this.selectedBeneficiary.beneficiaryBankCode,
    //   otp:
    //     this.page != 'otp'
    //       ? this.hwtForm.controls.hwt.value
    //       : this.Otpform.controls.otp.value,
    //   recurrent: this.isRecurrentPayment,
    //   returnTranId: true,
    //   sessionId: this.tranId,
    //   sourceAccountName: this.selectedAccount.accountName,
    //   sourceAccountNo: this.selectedAccount.accountNumber,
    //   sourceRefId: this.otpReference,
    //   transferMedium: 0,
    //   transferType: 'ONE-OFF',
    //   userId: StorageService.UserId,
    //   operationType: 'ONE_OFF_PAYMENT',
    //   sourceAccountCurrency: self.selectedAccount.currency,
    //   DeviceCookie: JSON.parse(localStorage.getItem('deviceID')).DeviceCookie,
    //   DeviceUUID: JSON.parse(localStorage.getItem('deviceID')).DeviceUUID,
    //   ClientTimeZone: resolvedTimezoneSettings.timeZone,
    //   IsLocalCookie: true,
    //   AvailableBalance: this.selectedAccount.availableBalance,
    //   LoginSessionId: this.miscService.generateSessionId(),
    //   OTPType: this.page != 'otp' ? 2 : this.page === 'otp' ? 1 : 0,
    // };

    // if (
    //   // correct later on auth availability
    //   this.selectedBeneficiary.beneficiaryBankCode.toLowerCase() != '221'
    // ) {
    //   payload.transferMedium = 1;
    // }

    // if (
    //   VariablesService.TransferChannelOrder &&
    //   VariablesService.TransferChannelOrder.length > 0
    // ) {
    //   if (
    //     VariablesService.TransferChannelOrder[0].toLowerCase() ==
    //     Constants.NIP_CHANNEL_CODE.toLowerCase()
    //   ) {
    //     payload.transferMedium = Constants.NIP_CHANNEL_CODE_IN_DIGIT;
    //   } else if (
    //     VariablesService.TransferChannelOrder[0].toLowerCase() ==
    //     Constants.ISW_CHANNEL_CODE.toLowerCase()
    //   ) {
    //     payload.transferMedium = Constants.ISW_CHANNEL_CODE_IN_DIGIT;
    //   } else if (
    //     VariablesService.TransferChannelOrder[0].toLowerCase() ==
    //     Constants.ACH_CHANNEL_CODE.toLowerCase()
    //   ) {
    //     payload.transferMedium = Constants.ACH_CHANNEL_CODE_IN_DIGIT;
    //   }
    // }

    // if (
   
    //   this.selectedBeneficiary.beneficiaryBankCode == '221'
    // ) {
    //   payload.transferMedium = 0;
    // }

    // this.transferDate = payload.transferDate;

    // this.doRetailTransfer(payload);

    // self.hwtForm.reset();
  }

  private doRetailTransfer(payload: TransferRequestPayload) {
    this.transactionService.doTransfer(payload).then(
      (response) => {
        this.loaderIsActive = false;
        this.transferMessage = response.ResponseFriendlyMessage;
        this.tranAmount = 0;
        if (response.amount !== undefined && response.amount != null) {
          try {
            this.tranAmount = +response.amount;
          } catch {}
        }

        if (
          response &&
          response.ResponseCode &&
          response.ResponseCode == ResponseCodes.SUCCESS
        ) {
          const successDialogSub = this.dialog.open(SuccessDialogComponent, {
            data: {
              message: `N${this.amountValue} successfully sent `,
              icon: 'done',
              description: 'success',
            },
            backdropClass: 'blurred',
          });
          successDialogSub.afterClosed().subscribe(() => {
            this.onClearForm();
            this.page = 'form';
          });
          if (payload.destinationBankCode.toLowerCase() == '304') {
          }

          this.updateAvailableBalanceAndDailyTransferLimit();
        }

        if (
          response.transactionId == null ||
          (response.transactionId &&
            response.transactionId.includes('-999-')) ||
          response.transactionId == 'null'
        ) {
          response.transactionId = payload.sessionId;
          const successDialogSub = this.dialog.open(SuccessDialogComponent, {
            data: {
              message: response.ResponseDescription,
              icon: 'close',
              description: 'failed',
            },
            disableClose: true,
            backdropClass: 'blurred',
          });
          successDialogSub.afterClosed().subscribe(() => {
            this.onClearForm();
            this.page = 'form';
          });
        }
        this.tranId = response.transactionId;
      },
      (error) => {
        this.loaderIsActive = false;

        if (error && error.status != 401) {
          this.snackBar.open(
            'Your request cannot be completed at the moment due to a technical error, please try again later',
            'Ok',
            {
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              duration: 1500,
            }
          );
        }
      }
    );
    this.hwtForm.reset();
  }

  updateAvailableBalanceAndDailyTransferLimit() {
    if (this.selectedAccount) {
      this.selectedAccount.availableBalance =
        this.selectedAccount.availableBalance - this.tranAmount;

      this.amountUtilizedFromLimit =
        +this.amountUtilizedFromLimit + +this.tranAmount;

      if (
        StorageService.DailyTransferLimit &&
        StorageService.DailyTransferLimit.length > 0
      ) {
        let limits = StorageService.DailyTransferLimit.find(
          (x) =>
            x.currency.toLowerCase() ==
            this.dailyTransferLimits.currency.toLowerCase()
        );
        if (limits) {
          limits.dailyLimitsAvailable =
            +limits.dailyLimitsAvailable - +this.tranAmount;
          this.dailyTransferLimits = limits;
        }
      }
    }
  }

  stopTimer() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }

  onCancel() {
    this.stopTimer();
    this.page = 'form';
    this.onClearForm();
  }

  // ngOnDestroy(){
  //   this.timerSubscription.unsubscribe();
  // }

  confirmOtp() {
    this.stopTimer();
    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: { message: 'N100,000 successfully sent' },
      backdropClass: 'blurred',
      // disableClose: true
    });
    successDialogSub.afterClosed().subscribe(() => {
      this.beneficiaryTransferForm.reset();
      this.selectedAccount = null;
      this.selectedAccount = null;
      this.selectedCategory = null;
      this.page = 'form';
    });
  }

  sortBeneficiaries(beneficiaries): Beneficiary[] {
    return beneficiaries.sort((a: Beneficiary, b: Beneficiary) => {
      if (a.beneficiaryAlias < b.beneficiaryAlias) return -1;
      if (a.beneficiaryAlias > b.beneficiaryAlias) return 1;
      return 0;
    });
  }



  getBeneficiaries() {
    if (StorageService.Benficiaries) {
      this.beneficiaries = StorageService.Benficiaries.slice();
      this.reducedBeneficiariesList =
        this.beneficiaries.length > 5
          ? this.beneficiaries.slice(0, 5)
          : this.beneficiaries.slice();
      return;
    }
    this.beneficiaryListSub = this.transactionService
      .getBeneficiaries()
      .subscribe((response) => {
        if (response.ResponseCode == ResponseCodes.SUCCESS) {
          StorageService.Benficiaries = this.sortBeneficiaries(
            response.Beneficiaries
          );
          if(response.ResponseDescription === 'No records fetched') {
            StorageService.Benficiaries = [];
            this.beneficiaries = [];
            return
          }
          this.beneficiaries = StorageService.Benficiaries.slice();
          this.reducedBeneficiariesList =
            this.beneficiaries.length > 5
              ? this.beneficiaries.slice(0, 5)
              : this.beneficiaries.slice();
        }
      });
  }

  goBack() {
    this.page = 'form';
  }
}
