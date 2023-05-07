import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { CustomerAccount, DailyTransferLimits, TransferRequestPayload } from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BanksListDialogComponent } from 'src/app/shared/bankslist-dialog/bankslist-dialog.component';
import { CategoryDialogComponent } from 'src/app/shared/category-dialog/category-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';


@Component({
  selector: 'app-transfer-stanbic',
  templateUrl: './transfer-stanbic.component.html',
  styleUrls: ['./transfer-stanbic.component.scss']
})
export class TransferStanbicComponent implements OnInit {

  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  otpSendClicked: boolean = false;
  receiptAccntNo: string;

  hwtForm: FormGroup;
  receipientAccountTimer: any;
  nameEnquiryStatus: boolean = false;

  stanbicTransferForm: FormGroup;

  selectedAccount: CustomerAccount;

  selectedBank: any;
  likelyBanks: any[];
  selectedCategory: string;
  amountValue: string;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;
  timerSubscription: Subscription;
  otpReference: string;
  exceptionMessage: string;
  insufficientFund: boolean;
  transferSuccessful: boolean;
  transferMessage: string;
  transferDate: string;
  tranId: string;
  nubanReturnsNonEmptyList: boolean;
  getChargesSub: Subscription;
  getTransferLimitSub: Subscription;
  nameEnquiryDetails: any;
  nameEnquirySub: Subscription;
  isRecurrentPayment: boolean = false;
  showCharges: boolean = false;
  transferCharges: any;

  insufficientFundTimer: any;

  tranAmount: number;

  withinDailyLimit: boolean;

  exceptionDialogRef: MatDialogRef<any>;

  // NB API Variables
  accountList: Array<CustomerAccount> = [];
  isVbBank: boolean = false;

  // myDebitableAccounts: Array<CustomerAccount>;
  selectedSourceAccount: CustomerAccount;

  availableBalance: number;
  transactionCurrency: string;
  initiateOTPSub: Subscription;

  otherBankCharges: number = 50;

  availableLimit: number;
  amountUtilizedFromLimit: number;
  loaderMsg: string;
  accountCheckTimer: any;
  deviceCookie: string;
  deviceUUID: string;
  timeZone: string;
  isLocalCookie: boolean;

  loaderIsActive: boolean;
  otherBankNonLocalChargesError: boolean;
  formSubmitted: boolean;
  notificationType: string;
  maskedOtpAddress: string;
  dailyTransferLimits: DailyTransferLimits;

  getConversionRateSub: Subscription;
  destinationCurrency: string;
  currencyConversionRate: number;
  amountInDestinationCurrency: number;
  showConversionRate: boolean;
  isCustomerHWTEnabled: boolean;
  displayedTotal: string;

  // export interface CustomerAccount {
  //   accountNumber: string;
  //   accountName: string;
  //   debitAllowed: boolean;
  //   creditAllowed: boolean;
  //   accountType: string;
  //   accountCategory: string;
  //   effectiveBalance: number;
  //   availableBalance: number;
  //   currency: string;
  //   isNICard? : boolean;
  //   PanMasked? : string;
  //   Foracid?:string;
  //   ExpDate?:string;
  // };

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private miscService: MiscService
  ) {}

  ngOnInit(): void {
    this.stanbicTransferForm = new FormGroup({
      'debited-account': new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      'recepient-account': new FormControl(null, [Validators.required]),
      // 'recepient-bank': new FormControl(null, [Validators.required]),
      'transaction-category': new FormControl(null),
      narration: new FormControl(null, [Validators.required]),
    });
    this.selectedCategory = 'Others - CI';
        console.log(this.selectedCategory)
        this.stanbicTransferForm
          .get('transaction-category')
          .setValue(this.selectedCategory);

    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });

    this.page = 'form';

    this.accountList = mockAccounts;
  }

  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  onAccountSelect(index: number) {
    this.selectedAccount = this.accountList[index];
    this.stanbicTransferForm
      .get('debited-account')
      .setValue(this.selectedAccount.accountNumber);
    this.availableBalance = this.selectedAccount.availableBalance;
    this.transactionCurrency = this.selectedAccount.currency.toUpperCase();
  }

  // doNameEnquiry() {
  //   this.loaderIsActive = true;

  //   let transferMedium = 0;

  //   this.nameEnquirySub = this.transactionService
  //     .doNameEnquiry({
  //       UserId: StorageService.UserId,
  //       destinationAccountNo:
  //         this.stanbicTransferForm.controls['recepient-account'].value,
  //       destinationBankCode: this.selectedBank.code,

  //       transferMedium: transferMedium,
  //       sourceAccountNo: this.selectedAccount
  //         ? this.selectedAccount.accountNumber
  //         : '',
  //     })
  //     .subscribe(
  //       (response) => {
  //         this.loaderIsActive = false;

  //         if (response.ResponseCode === ResponseCodes.SUCCESS) {
  //           this.nameEnquiryDetails = response;
  //           this.nameEnquiryStatus = true;
  //         } else {
  //           console.log(this.nameEnquiryStatus)
  //           console.log(response.ResponseDescription)
  //           this.loaderIsActive = false;
  //           this.nameEnquiryStatus = false;
  //           this.snackBar.open(
  //             'The Account Number entered is Invalid',
  //             'Ok',
  //             {
  //               verticalPosition: 'bottom',
  //               horizontalPosition: 'right',
  //               duration: 2000,
  //             }
  //           );
  //         }
  //       },
  //       (error: any) => {
  //         this.loaderIsActive = false;
  //       }
  //     );

  //   return false;
  // }

  private doSMETransfer(payload: TransferRequestPayload) {
    // this.transactionService.doTransfer(payload).subscribe(
    //   {
    //     next: (response) => {
    //       this.loaderIsActive = false;
    //       this.transferMessage = response.ResponseFriendlyMessage;
    //       this.tranAmount = 0;
    //       if (response.amount !== undefined && response.amount != null) {
    //         try {
    //           this.tranAmount = +response.amount;
    //         } catch {}
    //       }
    //       if (
    //         response &&
    //         response.ResponseCode &&
    //         response.ResponseCode == ResponseCodes.SUCCESS
    //       ) {
    //         const successDialogSub = this.dialog.open(SuccessDialogComponent, {
    //           data: {
    //             message: response.ResponseFriendlyMessage,
    //             icon: 'done',
    //             description: 'success',
    //           },
    //           backdropClass: 'blurred',
    //         });
    //         successDialogSub.afterClosed().subscribe(() => {
    //           this.onClearForm();
    //           this.page = 'form';
    //         });
    //         if (payload.destinationBankCode.toLowerCase() == '304') {
    //         }
    //         this.updateAvailableBalanceAndDailyTransferLimit();
    //         return
    //       }
    //       if (
    //         !response ||
    //         (response.ResponseCode !== ResponseCodes.SUCCESS &&
    //           response.ResponseCode !== "70" &&
    //           response.ResponseCode !== "99")
    //       ) {
    //         response.transactionId = payload.sessionId;
    //         const successDialogSub = this.dialog.open(SuccessDialogComponent, {
    //           data: {
    //             message: response.ResponseFriendlyMessage,
    //             icon: 'close',
    //             description: 'failed',
    //           },
    //           disableClose: true,
    //           backdropClass: 'blurred',
    //         });
    //         successDialogSub.afterClosed().subscribe(() => {
    //           this.onClearForm();
    //           this.page = 'form';
    //         });
    //         return;
    //       }
    //       if (response.ResponseCode === "99") {
    //         this.snackBar.open(`${response.ResponseFriendlyMessage}`, "Ok", {
    //           duration: 45000,
    //         });
    //         return;
    //       }
    //       this.tranId = response.transactionId;
    //     },
    //     error: (error) => {
    //       this.loaderIsActive = false;
    //     if (error && error.status != 401) {
    //       this.snackBar.open(
    //         'Your request cannot be completed at the moment due to a technical error, please try again later',
    //         'Ok',
    //         {
    //           verticalPosition: 'bottom',
    //           horizontalPosition: 'right',
    //           duration: 1500,
    //         }
    //       );
    //     }
    //     }
    //   }
    // );
    // this.hwtForm.reset();
  }

  // getConversionRate() {
  //   this.getConversionRateSub = this.transactionService
  //     .getCurrencyConversionRate({
  //       destinationAccountNo:
  //       this.stanbicTransferForm.get('recepient-account').value,
  //       sourceAccountCurrency: this.selectedAccount.currency,
  //     })
  //     .subscribe((response) => {
  //       if (response.ResponseCode === ResponseCodes.SUCCESS) {
  //         if (
  //           response.DestinationCurrency &&
  //           response.DestinationCurrency.toLowerCase() !=
  //             this.selectedSourceAccount.currency.toLowerCase()
  //         ) {
  //           this.destinationCurrency = response.DestinationCurrency;

  //           if (Number(response.Rate) > 0) {
  //             this.currencyConversionRate = Number(response.Rate);
  //             this.amountInDestinationCurrency =
  //               this.currencyConversionRate *
  //               Number(this.getTotalAmountWithoutCharges());
  //           }
  //         }
  //       }
  //     });
  // }

  // updateAvailableBalanceAndDailyTransferLimit() {
  //   if (this.selectedSourceAccount) {
  //     this.selectedSourceAccount.availableBalance =
  //       this.selectedSourceAccount.availableBalance - this.tranAmount;

  //     this.amountUtilizedFromLimit =
  //       +this.amountUtilizedFromLimit + +this.tranAmount;

  //     if (
  //       StorageService.DailyTransferLimit &&
  //       StorageService.DailyTransferLimit.length > 0
  //     ) {
  //       let limits = StorageService.DailyTransferLimit.find(
  //         (x) =>
  //           x.currency.toLowerCase() ==
  //           this.dailyTransferLimits.currency.toLowerCase()
  //       );
  //       if (limits) {
  //         limits.dailyLimitsAvailable =
  //           +limits.dailyLimitsAvailable - +this.tranAmount;
  //         this.dailyTransferLimits = limits;
  //       }
  //     }
  //   }
  // }

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

  getTotalAmount() {
    let amountEntered = this.stanbicTransferForm.controls['amount'].value;

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

  computeTotalAmount() {
    let amount = 0.0;

    // Only allow digits on amount alone.
    if (this.stanbicTransferForm.controls['amount']) {
      let amountEntered = this.stanbicTransferForm.controls['amount'].value;

      amountEntered = this.miscService.getSanitizedAmount(amountEntered);
      amount = parseFloat(amountEntered);

      if (this.showCharges && amount > 0) {
        // this.computeTransferCharges(amount);

        this.tranAmount = this.getTotalAmount();
      } else if (!this.showCharges && amount > 0) {
        this.tranAmount = amountEntered;
      }
    }
  }

  numberCheck(args: any) {
    if (args.key === 'e' || args.key === '+' || args.key === '-') {
      let amount = 0.0;

      // Only allow digits on amount alone.

      return false;
    } else {
      setTimeout(() => {
        this.revalidateAmount();
        this.computeTotalAmount();
      }, 1000);

      // this.commaFormat(args);
      return true;
    }
  }

  bankSelect() {
    const bankListDialogSub = this.dialog.open(BanksListDialogComponent, {
      data: { selectedBank: '', likelyBanks: this.likelyBanks },
      // disableClose: true,
      backdropClass: 'blurred',
    });

    bankListDialogSub.afterClosed().subscribe((response) => {
      this.selectedBank = response;
      this.stanbicTransferForm
        .get('recepient-bank')
        .setValue(this.selectedBank.name);
      if (
        this.stanbicTransferForm.get('recepient-bank').valid &&
        this.stanbicTransferForm.get('amount').valid
      ) {
        if (this.selectedBank.bankCode != '221') {
          this.showCharges = true;
          let amountEntered =
            this.stanbicTransferForm.controls['amount'].value;
          if (amountEntered) {
            if ((amountEntered as string).indexOf('.00') != -1) {
              amountEntered = (amountEntered as string).replace('.00', '');
            }
            amountEntered = amountEntered.replace(/,/g, ''); //remove all commas
          }
          amountEntered = +amountEntered;

          // this.computeTransferCharges(amountEntered);
          this.computeTotalAmount();
        } else {
          this.showCharges = false;
          // this.otherBankCharges = 0;
        }
        this.revalidateAmount();
      }
      if (
        this.stanbicTransferForm.get('recepient-bank').valid &&
        this.stanbicTransferForm.get('recepient-account').valid
      ) {
        // this.doNameEnquiry();
      }

      this.isVbBank = false;
      if (this.selectedBank.code.toLowerCase() == '304') {
        this.isVbBank = true;
      }
    });
  }

  formatNumber(input: string) {
    let value = this.stanbicTransferForm.get(input).value;
    if (value) {
      this.stanbicTransferForm.get(input).setValue(value.replace(/\D/g, ''));
    }
  }

  setRecipientDetails() {
    // clearTimeout(this.receipientAccountTimer);

    this.formatNumber('recepient-account');
    clearTimeout(this.accountCheckTimer);
    this.accountCheckTimer = setTimeout(() => {
      if (this.stanbicTransferForm.get('recepient-account').valid) {
        this.nameEnquiryDetails = 'CONTENT';
      } else {
        this.nameEnquiryDetails = null;
      }
    }, 1000);
    // this.receipientAccountTimer = setTimeout(() => {
    // if (this.stanbicTransferForm.get('recepient-account').valid) {
    //   this.receiptAccntNo =
    //     this.stanbicTransferForm.get('recepient-account').value;

    //   if (this.storageService.Banks) {
    //     let potentialBanks = this.miscService.nubanValidator(
    //       this.receiptAccntNo,
    //       StorageService.Banks
    //     );

    //     if (potentialBanks && potentialBanks.length > 0) {
    //       this.likelyBanks = potentialBanks.filter((x) => x.code.length === 3);
    //       this.nubanReturnsNonEmptyList = true;
    //     } else {
    //       this.nubanReturnsNonEmptyList = false;
    //     }
    //   }
    // } else {
    //   this.receiptAccntNo = null;
    // }
    // if (
    //   this.stanbicTransferForm.get('recepient-bank').valid &&
    //   this.stanbicTransferForm.get('recepient-account').valid
    // ) {
    //   // this.doNameEnquiry();
    // }
    // // }, 1000);
  }

  // computeTransferCharges(amount: number) {
  //   if (
  //     StorageService.TransferCharges &&
  //     StorageService.TransferCharges.length > 0
  //   ) {
  //     for (let chargeObj of StorageService.TransferCharges) {
  //       if (chargeObj.StartAmount >= 0 && chargeObj.EndAmount > 0) {
  //         if (
  //           amount >= chargeObj.StartAmount &&
  //           amount <= chargeObj.EndAmount
  //         ) {
  //           this.otherBankCharges = chargeObj.Charges;
  //           break;
  //         }
  //       } else if (chargeObj.StartAmount >= 0) {
  //         if (amount >= chargeObj.StartAmount) {
  //           this.otherBankCharges = chargeObj.Charges;
  //           break;
  //         }
  //       }
  //     }

  //     return StorageService.TransferCharges[
  //       StorageService.TransferCharges.length - 1
  //     ].Charges;
  //   }

  //   return 0;
  // }

  categorySelect() {
    const catDialogSub = this.dialog.open(CategoryDialogComponent, {
      data: { selectedCat: '' },
      disableClose: true,
      backdropClass: 'blurred',
    });
    catDialogSub.afterClosed().subscribe((response) => {
      if (response) {
        this.selectedCategory = response;
        console.log(this.selectedCategory)
        this.stanbicTransferForm
          .get('transaction-category')
          .setValue(this.selectedCategory);
      }
    });
  }

  sendOtp(event, status) {
    
    this.otpSendClicked = true;

    if (this.stanbicTransferForm.invalid) {
      return;
    }

    // if (!this.nameEnquiryStatus) {
    //     this.snackBar.open('The entered receipient account does not exist, please check and retry.', 'OK', {
    //       duration: 1500,
    //     });
    //   return
    // }
// 
     if (status == 'resend') {
      this.snackBar.open(
           `Please enter the One Time Code sent to you`,
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
    // this.initiateOTPSub = this.transactionService
    //   .initiateOtpRequest({
    //     UserId: StorageService.UserId,
    //     CifId: StorageService.CifId,
    //     ReasonCode: '05',
    //   })
    //   .subscribe(
    //     (response) => {
    //       this.loaderIsActive = false;

    //       if (
    //         response.ResponseCode &&
    //         response.ResponseCode === ResponseCodes.SUCCESS
    //       ) {
    //         this.page = 'otp';
    //         let seperatedNums = this.tranAmount.toString().split('.');
    //         this.displayedTotal =
    //           seperatedNums[0]
    //             .replace(/\D/g, '')
    //             .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    //           (seperatedNums[1] ? '.' + seperatedNums[1] : '');
    //         this.miscService.clearTimer();
    //         this.miscService.setTimer();
    //         this.timerSubscription = this.miscService.timeValues.subscribe(
    //           (timeData) => {
    //             this.minutes = timeData.minutes;
    //             this.seconds = timeData.seconds;
    //             this.timer = timeData.timer;
    //           }
    //         );

    //         this.otpReference = response.ResponseDescription;
    //         this.notificationType = response.NotificationType;
    //         this.maskedOtpAddress = response.NotificationAddress;

    //         this.snackBar.open(
    //           `Please enter the One Time Code sent to ${response.NotificationAddress}
    // `,
    //           'OK',
    //           { duration: 2000 }
    //         );

    //         return;
    //       }

    //       this.exceptionMessage = response.ResponseFriendlyMessage;
    //     },
    //     (error: any) => {
    //       this.loaderIsActive = false;
    //       if (error && error.status != 401) {
    //         this.exceptionMessage =
    //           'Your request cannot be completed at the moment due to a technical error, please try again later.';
    //       }
    //     }
    //   );
    // }
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

  getTotalAmountWithoutCharges() {
    let amountEntered = this.stanbicTransferForm.get('amount').value;

    if (amountEntered) {
      //remove .00 if exist
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    return +amountEntered;
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this;
    this.stopTimer();
    // this.loaderIsActive = true;
    this.transferSuccessful = false;
    this.transferMessage = '';
    let self = this;
    let resolvedTimezoneSettings = Intl.DateTimeFormat().resolvedOptions();

    // this.tranId = this.miscService.generateSessionId();
    // let payload = {
    //   amount: self.getTotalAmountWithoutCharges(),

    //   // This needs clarification
    //   customerReference: this.stanbicTransferForm.get('narration').value,

    //   // This needs clarification
    //   beneficiaryReference: this.stanbicTransferForm.get('narration').value,

    //   transferDate: moment(new Date()).format('YYYY-MM-DD'),
    //   destinationAccountName: this.nameEnquiryDetails
    //     ? this.nameEnquiryDetails.destinationAccountName
    //     : '',
    //   destinationAccountNo:
    //     this.stanbicTransferForm.get('recepient-account').value,

    //   destinationBankCode: this.selectedBank.code,
    //   otp:
    //     this.page != 'otp'
    //       ? this.hwtForm.controls['hwt'].value
    //       : this.Otpform.controls['otp'].value,
    //   recurrent: this.isRecurrentPayment,
    //   returnTranId: true,
    //   sessionId: this.tranId,
    //   sourceAccountName: self.selectedAccount.accountName,
    //   sourceAccountNo: self.selectedAccount.accountNumber,
    //   sourceRefId: self.otpReference,
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
    //   this.selectedBank.code.toLowerCase() != '221'
    // ) {
    //   payload.transferMedium = 1;
    // }
    // if (
    //   // Adjust later on
    //   this.selectedBank.code == '221'
    // ) {
    //   payload.transferMedium = 0;
    // }
    // console.log('transf');

    // this.transferDate = payload.transferDate;

    // this.doSMETransfer(payload);

    // self.hwtForm.reset();
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
                this.nameEnquiryDetails = null;
              });
  }

  onClearForm() {
    this.stanbicTransferForm.reset();
    this.receiptAccntNo = '';
    this.selectedAccount = null;
    this.selectedBank = null;
    this.selectedCategory = null;
    this.otpSendClicked = false;
    this.tranAmount = 0;
    this.amountValue = '';
  }

  goBack() {
    this.page = 'form';
  }

}
