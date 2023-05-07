import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import {
  CustomerAccount,
  TransferRequestPayload,
  DailyTransferLimits,
  WalletTransferRequestPayload,
} from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CategoryDialogComponent } from 'src/app/shared/category-dialog/category-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';

@Component({
  selector: 'app-transfer-ease',
  templateUrl: './transfer-ease.component.html',
  styleUrls: ['./transfer-ease.component.scss'],
})
export class TransferEaseComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  otpSendClicked: boolean = false;
  loaderIsActive: boolean = false;

  isCustomerHWTEnabled: boolean;
  initiateOTPSub: Subscription;
  challengeSuccessful: boolean;

  easeTransferForm: FormGroup;
  hwtForm: FormGroup;

  selectedAccount: CustomerAccount;
  selectedSourceAccount: CustomerAccount;
  nameEnquirySub: Subscription;
  nameEnquiryDetails: any;
  exceptionMessage: string;

  XCck: string;
  XTranId: string;
  XFLRE: boolean;
  tranId: string;
  deviceCookie: string;
  deviceUUID: string;
  timeZone: string;
  isLocalCookie: boolean;
  isRecurrentPayment: boolean = false;
  transferPayload: WalletTransferRequestPayload;
  destinationCurrency: string;

  // selectedAccount: {
  //   number: string;
  //   type: string;
  //   balance: string;
  //   abbrev: string;
  // };

  selectedCategory: string;
  amountValue: string;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;
  timerSubscription: Subscription;
  accountCheckTimer: any;
  availableBalance: number;
  transactionCurrency: string;
  dailyTransferLimits: DailyTransferLimits;
  availableLimit: number;
  amountUtilizedFromLimit: number;
  loaderMsg: string;
  withinDailyLimit: boolean;
  receiptAccntNo: string;
  receipientAccountTimer: any;
  otpReference: string;
  notificationType: string;
  maskedOtpAddress: string;
  transferDate: string;
  transferMessage: string;

  insufficientFund: boolean;
  insufficientFundTimer: any;
  numberCheckTimer: any;
  tranAmount: number;

  accountList: Array<CustomerAccount> = [];
  myDebitableAccounts: Array<CustomerAccount>;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private miscService: MiscService
  ) {}

  ngOnInit(): void {
    this.easeTransferForm = new FormGroup({
      'debited-account': new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      '@ease-account': new FormControl(null, [Validators.required]),
      'transaction-category': new FormControl(null),
      narration: new FormControl(null, [Validators.required]),
    });
    this.page = 'form';

    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });

    this.accountList = mockAccounts;

    this.myDebitableAccounts =
      this.accountList && this.accountList.length > 0
        ? this.accountList.filter((x) => x.debitAllowed === true)
        : [];

    if (this.myDebitableAccounts) {
      this.selectedSourceAccount = this.myDebitableAccounts[0];
    }
  }

  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  onAccountSelect(index: number) {
    this.selectedAccount = this.accountList[index];
    this.easeTransferForm
      .get('debited-account')
      .setValue(this.selectedAccount.accountNumber);

    // API bit. Comment back every commented out bit once API becomes available
    // this.selectedSourceAccount = evtData.value as CustomerAccount;

    this.availableBalance = this.selectedAccount.availableBalance;
    this.transactionCurrency = this.selectedAccount.currency.toUpperCase();

    // Remember to ask for the correct payload for this API
    // this.getTransferLimitOnSourceAccountChange();
  }

  setRecipientDetails() {
    this.formatNumber('@ease-account');
    clearTimeout(this.accountCheckTimer);
    this.accountCheckTimer = setTimeout(() => {
      if (this.easeTransferForm.get('@ease-account').valid) {
        this.nameEnquiryDetails = 'CONTENT';
      } else {
        this.nameEnquiryDetails = null;
      }
    }, 1000);
    // if (this.easeTransferForm.get('@ease-account').valid) {
    //   console.log('valid');
    //   this.receiptAccntNo = this.easeTransferForm.get('@ease-account').value;
    //   // this.doNameEnquiry();
    // } else {
    //   this.receiptAccntNo = null;
    // }
  }

  formatNumber(input: string) {
    if (input == 'otp') {
      let value = this.Otpform.controls.otp.value;
      if (value) {
        this.Otpform.controls.otp.setValue(value.replace(/\D/g, ''));
      }
    }
    let value = this.easeTransferForm.get(input).value;
    if (value) {
      this.easeTransferForm.get(input).setValue(value.replace(/\D/g, ''));
    }
  }

  doNameEnquiry() {
    // this.loaderIsActive = true;

    let self = this;

    // let transferMedium = 0;

    this.loaderMsg = '';

    this.nameEnquirySub = this.transactionService
      .doNameEnquiry({
        UserId: StorageService.UserId,
        destinationAccountNo: this.easeTransferForm.get('@ease-account').value,
        destinationBankCode: '304',
        transferMedium: 1,
        sourceAccountNo: this.selectedAccount
          ? this.selectedAccount.accountNumber
          : '',
      })
      .subscribe
      // (response) => {
      //   this.loaderIsActive = false;

      //   // if (response.ResponseCode === ResponseCodes.SUCCESS) {
      //   //   self.nameEnquiryDetails = response;
      //   // } else {
      //   //   self.exceptionMessage = response.ResponseFriendlyMessage;
      //   //   // self.exceptionDialogRef = UtilService.showExceptionDialog(
      //   //   //   self.exceptionDialogRef,
      //   //   //   self.errorModalTemplateRef,
      //   //   //   self._matDialog
      //   //   // );
      //   // }
      // },
      // (error: any) => {
      //   self.loaderIsActive = false;

      //   if (error && error.status != 401) {
      //     self.exceptionMessage =
      //       'Your request cannot be completed at the moment due to a technical error, please try again later.';
      //     // self.exceptionDialogRef = UtilService.showExceptionDialog(
      //     //   self.exceptionDialogRef,
      //     //   self.errorModalTemplateRef,
      //     //   self._matDialog
      //     // );
      //   }
      // }
      ();
    // }

    return false;
  }

  commaFormat(event) {
    if (event.which >= 37 && event.which <= 40) return;
    // format number
    if (this.amountValue) {
      const removeComma = this.amountValue.replace(/\,/g, '');
      console.log(removeComma);
      const validNumber = +removeComma;
      this.amountValue = validNumber
        .toString()
        .replace(/\D/g, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const removeComma = this.amountValue.replace(/\,/g, '');
    const validNumber = +removeComma;
    if (validNumber >= 50000) {
      this.snackBar.open(
        'Amount exceeds maximum allowable amount for @ease transfer',
        'OK',
        {
          duration: 1500,
        }
      );
      return;
    }
  }

  numberCheck(args) {
    if (args.key === 'e' || args.key === '+' || args.key === '-') {
      return false;
    } else {
      if (this.easeTransferForm.get('debited-account').valid) {
        clearTimeout(this.numberCheckTimer);
        this.numberCheckTimer = setTimeout(() => {
          this.revalidateAmount();
          this.computeTotalAmount();
        }, 1000);
      }
      return true;
    }
  }

  computeTotalAmount() {
    let amount = 0.0;

    // Only allow digits on amount alone.
    if (this.easeTransferForm.controls['amount']) {
      let amountEntered = this.easeTransferForm.controls['amount'].value;

      amountEntered = this.miscService.getSanitizedAmount(amountEntered);
      amount = parseFloat(amountEntered);
      this.tranAmount = amountEntered;

      // if (this.showCharges && amount > 0) {
      //   clearTimeout(this.transferCharges);
      //   // this.tranAmount = this.getTotalAmount();
      // } else if (!this.showCharges && amount > 0) {

      // }
    }
  }

  revalidateAmount() {
    let amountValid = true;
    let amount = +this.easeTransferForm.get('amount').value.replace(/,/g, '');
    console.log(amount);
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
    let amountEntered = this.easeTransferForm.get('amount').value;

    if (amountEntered) {
      //remove .00 if exist
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    return +amountEntered;
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
        this.easeTransferForm
          .get('transaction-category')
          .setValue(this.selectedCategory);
      }
    });
  }

  sendOtp(event, status) {
   
    this.otpSendClicked = true;

    if (this.easeTransferForm.invalid) {
      return;
    }

    if (status === 'resend') {
      this.snackBar.open(
         `Please enter the One Time Code sent to you
         `,
          'OK',
              { duration: 2000 }
              );
      event.currentTarget.reset();
      this.onClearForm();
    }

    if (this.tranAmount > this.availableBalance) {
      this.snackBar.open('You have an insufficient balance.', 'OK', {
        duration: 1000,
      });
      return;
    }

    if (this.tranAmount > 50000) {
      this.snackBar.open('Maximum amount allowed of 50,000 has been exceeded.', 'OK', {
        duration: 1000,
      });
      return;
    }
    console.log('succesful otp');
    this.page = 'otp';
    this.miscService.setTimer();

    this.timerSubscription = this.miscService.timeValues.subscribe(
      (timeData) => {
        this.minutes = timeData.minutes;
        this.seconds = timeData.seconds;
        this.timer = timeData.timer;
      }
    );
    //this.loaderIsActive = true;

    if (this.isCustomerHWTEnabled) {
      this.page = 'hwt';
      return;
    } else {
      this.initiateOTPSub = this.transactionService
        .initiateOtpRequest({
          UserId: StorageService.UserId,
          CifId: StorageService.CifId,
          ReasonCode: '05',
        })
        .subscribe(
          (response) => {
            this.loaderIsActive = false;

            if (
              response.ResponseCode &&
              response.ResponseCode === ResponseCodes.SUCCESS
            ) {
              console.log('succesful otp');
              this.page = 'otp';
              this.miscService.setTimer();

              this.timerSubscription = this.miscService.timeValues.subscribe(
                (timeData) => {
                  this.minutes = timeData.minutes;
                  this.seconds = timeData.seconds;
                  this.timer = timeData.timer;
                }
              );

              this.otpReference = response.ResponseDescription;
              this.notificationType = response.NotificationType;
              this.maskedOtpAddress = response.NotificationAddress;

              this.snackBar.open(
                `Please enter the One Time Code sent to ${response.NotificationAddress}
      `,
                'OK',
                { duration: 2000 }
              );

              return;
            }

            this.exceptionMessage = response.ResponseFriendlyMessage;
          },
          (error: any) => {
            this.loaderIsActive = false;
            if (error && error.status != 401) {
              this.exceptionMessage =
                'Your request cannot be completed at the moment due to a technical error, please try again later.';
            }
          }
        );
    }
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;
    // this.transferSuccessful = false;
    // this.transferMessage = '';
    let self = this;
    // const customerReference = '';
    const beneficiaryReference = '';
    const destinationAccountName = '';
    let resolvedTimezoneSettings = Intl.DateTimeFormat().resolvedOptions();

    this.tranId = this.miscService.generateSessionId();

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
    // let payload = {
    //   amount: self.getTotalAmountWithoutCharges(),
    //   customerReference: this.easeTransferForm.get('narration').value,
    //   beneficiaryReference: this.easeTransferForm.get('narration').value,

    //   transferDate: moment(new Date()).format('YYYY-MM-DD'),
    //   destinationAccountName: this.nameEnquiryDetails
    //     ? this.nameEnquiryDetails.destinationAccountName
    //     : '',
    //   destinationAccountNo: self.easeTransferForm.get('@ease-account').value,

    //   destinationBankCode: '304',
    //   otp:
    //     this.page != 'otp'
    //       ? this.hwtForm.controls.hwt.value
    //       : self.Otpform.controls.otp.value,
    //   recurrent: '',
    //   returnTranId: true,
    //   sessionId: this.tranId,
    //   sourceAccountName: self.selectedAccount.accountName,
    //   sourceAccountNo: self.selectedAccount.accountNumber,
    //   sourceRefId: self.otpReference,
    //   sourceAccountCurrency: this.selectedAccount.currency,
    //   transferMedium: 1,
    //   transferType: "ONE-OFF",
    //   userId: StorageService.UserId,
    //   operationType: "ONE-OFF",
    //   OTPType: this.page != 'otp' ? 2 : this.page === 'otp' ? 1 : 0,
    //   DeviceCookie: JSON.parse(localStorage.getItem('deviceID')).DeviceCookie,
    //   DeviceUUID: JSON.parse(localStorage.getItem('deviceID')).DeviceUUID,
    //   ClientTimeZone: resolvedTimezoneSettings.timeZone,
    //   IsLocalCookie: true,
    //   AvailableBalance: this.selectedAccount? this.selectedAccount.availableBalance: '',
    //   LoginSessionId: this.miscService.generateSessionId(),
    // };

    // if (
    //   // correct later on auth availability
    //   this.selectedBank.code.toLowerCase() != '221'
    // ) {
    //   payload.transferMedium = 1;
    // }

    // if (
    //   StorageService.TransferChannelOrder &&
    //   StorageService.TransferChannelOrder.length > 0
    // ) {
    //   if (
    //     StorageService.TransferChannelOrder[0].toLowerCase() ==
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

    //   payload.transferMedium = 0;

    //   this.transferDate = payload.transferDate;

    //   this.doEaseTransfer(payload);
    // }

    // private doEaseTransfer(payload) {
    //   this.loaderMsg = `Initiating transfer .. please wait`;
    //   // this.transferSuccessful = this.showFuturePayment = false;
    //   this.transactionService.doTransfer(payload).then(
    //     (response) => {
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
    //             message: `N${this.amountValue} successfully sent `,
    //             icon: 'done',
    //             description: 'success',
    //           },
    //           backdropClass: 'blurred',
    //         });
    //         successDialogSub.afterClosed().subscribe(() => {
    //           this.onClearForm();
    //           this.page = 'form';
    //         });

    //         this.updateAvailableBalanceAndDailyTransferLimit();
    //       }

    //       if (
    //         response.transactionId == null ||
    //         (response.transactionId &&
    //           response.transactionId.includes('-999-')) ||
    //         response.transactionId == 'null'
    //       ) {
    //         response.transactionId = payload.sessionId;
    //         const successDialogSub = this.dialog.open(SuccessDialogComponent, {
    //           data: {
    //             message: response.ResponseDescription,
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
    //       }
    //       this.tranId = response.transactionId;

    //       if (
    //         response.ResponseCode == ResponseCodes.TransferDynamicRouteFailure
    //       ) {
    //         this.transferPayload = payload;
    //       }
    //       if (
    //         response &&
    //         response.ResponseCode &&
    //         response.ResponseCode == ResponseCodes.IntellinxChallengeCode
    //       ) {
    //         this.XCck = response.XCck;
    //         this.XTranId = response.XTranId;
    //         return;
    //       }

    //       if (
    //         response.ResponseCode == ResponseCodes.TechnicalError &&
    //         response.XFLRE === true
    //       ) {
    //         this.XFLRE = true;
    //         this.XTranId = response.XTranId;
    //       }
    //       this.cdRef.detectChanges();
    //     },
    //     (error) => {
    //       this.loaderIsActive = false;

    //       if (error && error.status != 401) {
    //         this.snackBar.open(
    //           'Your request cannot be completed at the moment due to a technical error, please try again later.',
    //           'Ok',
    //           {
    //             verticalPosition: 'bottom',
    //             horizontalPosition: 'right',
    //             duration: 1500,
    //           }
    //         );
    //       }
    //     }
    //   );
    //   this.hwtForm.reset();
  }

  updateAvailableBalanceAndDailyTransferLimit() {
    if (this.selectedAccount) {
      this.selectedAccount.availableBalance =
        this.selectedAccount.availableBalance - this.tranAmount;

      this.amountUtilizedFromLimit =
        +this.amountUtilizedFromLimit + +this.tranAmount;

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

  stopTimer() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }

  onClearForm() {
    this.easeTransferForm.reset();
    this.receiptAccntNo = '';
    this.selectedAccount = null;
    this.selectedCategory = null;
    this.otpSendClicked = false;
    this.tranAmount = 0;
    this.amountValue = '';
  }

  onCancel() {
    this.stopTimer();
    this.page = 'form';
    this.onClearForm();
    // event.currentTarget.reset()
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
      this.page = 'form';
      this.easeTransferForm.reset();
      this.selectedAccount = null;
      // this.selectedBank = null;
      this.selectedCategory = null;
    });
  }

  goBack() {
    this.page = 'form';
  }
}
