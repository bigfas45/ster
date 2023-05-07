import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Subscription } from 'rxjs'
import { ResponseCodes } from 'src/app/core/Enumeration';
import { CustomerAccount, TransferRequestPayload, DailyTransferLimits } from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CategoryDialogComponent } from 'src/app/shared/category-dialog/category-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';

@Component({
  selector: 'app-transfer-self',
  templateUrl: './transfer-self.component.html',
  styleUrls: ['./transfer-self.component.scss'],
})
export class TransferSelfComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  otpSendClicked: boolean = false;

  selfTransferForm: FormGroup;

  selectedDebitAccount: CustomerAccount;
  selectedCreditAccount: CustomerAccount;

  selectedCategory: string;
  amountValue: string;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;
  timerSubscription: Subscription;
  receipientAccountTimer: any;
  selectedAccount: CustomerAccount;
  insufficientFundTimer: any;
  isRecurrentPayment: boolean = false;

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

  transferPayload: TransferRequestPayload;
  showCharges: boolean = false;
  transferCharges: any;
  challengeSuccessful: boolean;

  tranAmount: number;
  transAmountTimeout: any;

  withinDailyLimit: boolean;

  exceptionDialogRef: MatDialogRef<any>;

  accountList: Array<CustomerAccount> = [];
  isVbBank: boolean = false;

  myDebitableAccounts: Array<CustomerAccount>;
  selectedSourceAccount: CustomerAccount;

  availableBalance: number;
  transactionCurrency: string;
  dailyTransferLimits: DailyTransferLimits;
  initiateOTPSub: Subscription;

  availableLimit: number;
  amountUtilizedFromLimit: number;
  loaderMsg: string;

  notificationType: string;
  maskedOtpAddress: string;

  XCck: string;
  XTranId: string;
  XFLRE: boolean;

  deviceCookie: string;
  deviceUUID: string;
  timeZone: string;
  isLocalCookie: boolean;

  loaderIsActive: boolean;
  otherBankNonLocalChargesError: boolean;

  getConversionRateSub: Subscription;
  destinationCurrency: string;
  currencyConversionRate: number;
  amountInDestinationCurrency: number;
  showConversionRate: boolean;
  isCustomerHWTEnabled: boolean;

  hwtForm: FormGroup;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private miscService: MiscService
  ) {}

  ngOnInit(): void {
    this.selfTransferForm = new FormGroup({
      'debited-account': new FormControl(null, [Validators.required]),
      'credited-account': new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      'transaction-category': new FormControl(null),
      narration: new FormControl(null, [Validators.required]),
    });
    this.page = 'form';

    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });

    this.accountList = StorageService.CustomerAccounts;

    this.myDebitableAccounts =
      this.accountList && this.accountList.length > 0
        ? this.accountList.filter((x) => x.debitAllowed === true)
        : [];

    if (this.myDebitableAccounts) {
      this.selectedSourceAccount = this.myDebitableAccounts[0];
    }
    this.accountList = mockAccounts;
  }
  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  onAccountSelect(index: number, type: string) {
    if (type == 'debit') {
      this.selectedDebitAccount = this.accountList[index];
      this.selfTransferForm
        .get('debited-account')
        .setValue(this.selectedDebitAccount.accountNumber);
      this.availableBalance = this.selectedDebitAccount.availableBalance;
      if (this.selfTransferForm.get('amount').valid) {
        this.revalidateAmount();
      }
    }

    if (type == 'credit') {
      this.selectedCreditAccount = this.accountList[index];
      this.selfTransferForm
        .get('credited-account')
        .setValue(this.selectedCreditAccount.accountNumber);
    }
  }

  revalidateAmount() {


    let amountValid = true;
    let amount = +this.selfTransferForm.get('amount').value.replace(/,/g, '');
    if (amount > this.availableBalance) {
      this.insufficientFund = true;
      amountValid = false;
      clearTimeout(this.insufficientFundTimer);

      this.insufficientFundTimer = setTimeout(() => {
        this.snackBar.open('You have an insufficient balance.', 'OK', {
          duration: 1000,
        });
      }, 1000);

      // }
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
    let amountEntered = this.selfTransferForm.get('amount').value;

    if (amountEntered) {
      //remove .00 if exist
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    return +amountEntered;
  }

  onCreditedAccountSelect(index: number) {}

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

  numberCheck(args: any) {
    if (args.key === 'e' || args.key === '+' || args.key === '-') {
      let amount = 0.0;

      // Only allow digits on amount alone.

      return false;
    } else {
      clearTimeout(this.transAmountTimeout);

      this.transAmountTimeout = setTimeout(() => {
        this.revalidateAmount();
        this.computeTotalAmount();
      }, 1000);
      return true;
    }
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
        this.selfTransferForm
          .get('transaction-category')
          .setValue(this.selectedCategory);
      }
    });
  }

  computeTotalAmount() {
    let amount = 0.0;

    // Only allow digits on amount alone.
    if (this.selfTransferForm.controls['amount']) {
      let amountEntered = this.selfTransferForm.controls['amount'].value;

      amountEntered = this.miscService.getSanitizedAmount(amountEntered);
      amount = parseFloat(amountEntered);
      this.tranAmount = amountEntered;


    }
  }

  sendOtp(event, status) {
    
    this.otpSendClicked = true;

    if (this.selfTransferForm.invalid) {
      return;
    }

    if (status != 'resend') {
      this.snackBar.open(
       `Please enter the One Time Code sent to you  `,
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
    //this.loaderIsActive = true;
    this.page = 'otp';
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


    if (this.isCustomerHWTEnabled) {
      this.page = 'hwt';
      return;
    } else {
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
      //         this.exceptionMessage = 'Your request cannot be completed at the moment due to a technical error, please try again later.';
      //       }
      //     }
      //   );
    }
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;
    this.transferSuccessful = false;
    this.transferMessage = '';
    let self = this;
    const customerReference = '';
    const beneficiaryReference = '';
    const destinationAccountName = '';
    let resolvedTimezoneSettings = Intl.DateTimeFormat().resolvedOptions();

    this.tranId = this.miscService.generateSessionId();
    // let payload = {
    //   amount: self.getTotalAmountWithoutCharges(),

    //   // This needs clarification
    //   customerReference: this.selfTransferForm.get('narration').value,

    //   // This needs clarification
    //   beneficiaryReference: this.selfTransferForm.get('narration').value,

    //   transferDate: moment(new Date()).format('YYYY-MM-DD'),
    //   destinationAccountName: this.selectedCreditAccount.accountName,
    //   destinationAccountNo: self.selfTransferForm.get('credited-account').value,

    //   destinationBankCode: '221',
    //   otp:
    //     this.page != 'otp'
    //       ? this.hwtForm.controls.hwt.value
    //       : self.Otpform.controls.otp.value,
    //   recurrent: this.isRecurrentPayment,
    //   returnTranId: true,
    //   sessionId: this.tranId,
    //   sourceAccountName: self.selectedDebitAccount.accountName,
    //   sourceAccountNo: self.selectedDebitAccount.accountNumber,
    //   sourceRefId: self.otpReference,
    //   transferMedium: 0,
    //   transferType: 'ONE-OFF',
    //   userId: StorageService.UserId,
    //   operationType: 'ONE_OFF_PAYMENT',
    //   sourceAccountCurrency: self.selectedDebitAccount.currency,
    //   DeviceCookie: JSON.parse(localStorage.getItem('deviceID')).DeviceCookie,
    //   DeviceUUID: JSON.parse(localStorage.getItem('deviceID')).DeviceUUID,
    //   ClientTimeZone: resolvedTimezoneSettings.timeZone,
    //   IsLocalCookie: true,
    //   AvailableBalance: this.selectedDebitAccount.availableBalance,
    //   LoginSessionId: JSON.parse(localStorage.getItem('authData')).SessionId,
    //   OTPType:
    //   this.page != 'otp'
    //   ? 2
    //   : this.page === 'otp'
    //   ? 1
    //   : 0,
    // };

    // if (
    //   StorageService.TransferChannelOrder &&
    //   StorageService.TransferChannelOrder.length > 0
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

    // payload.transferMedium = 0;

    // this.transferDate = payload.transferDate;
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
      this.amountValue = '';
    });
    //this.doRetailTransfer(payload);

    // self.hwtForm.reset();
  }

  private doRetailTransfer(payload: TransferRequestPayload) {
    this.loaderMsg = `Initiating transfer .. please wait`;
    // this.transferSuccessful = this.showFuturePayment = false;
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
          // this.transferSuccessful = this.showFuturePayment = true;

          //hide beneficiary addition for @Ease accounts
          console.log('succesful Transfer');
          // if (payload.destinationBankCode.toLowerCase() == '304') {
          //   // this.showFuturePayment = false;
          // }

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
            backdropClass: 'blurred',
            // disableClose: true
          });
          successDialogSub.afterClosed().subscribe(() => {
            this.onClearForm();
            this.page = 'form';
            // this.otherBanksTransferForm.reset();
            // this.selectedAccount = null;
            // this.selectedBank = null;
            // this.selectedCategory = null;
          });
        }
        this.tranId = response.transactionId;

        if (
          response.ResponseCode == ResponseCodes.TransferDynamicRouteFailure
        ) {
          // this.showDynamicRouteButton = true;
          this.transferPayload = payload;
        }
        if (
          response &&
          response.ResponseCode &&
          response.ResponseCode == ResponseCodes.IntellinxChallengeCode
        ) {
          // this.showIntellinxValidationStepper = true;
          this.XCck = response.XCck;
          this.XTranId = response.XTranId;
          // this._activeStepper.next();
          return;
        }

        if (
          response.ResponseCode == ResponseCodes.TechnicalError &&
          response.XFLRE === true
        ) {
          this.XFLRE = true;
          this.XTranId = response.XTranId;
          // this.notifyIntellinxTransfer();
        }
        // this._activeStepper.next();
        this.cdRef.detectChanges();
      },
      (error) => {
        this.loaderIsActive = false;

        if (error && error.status != 401) {
          this.snackBar.open('Your request cannot be completed at the moment due to a technical error, please try again later', 'Ok', {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 1500,
          });
        }

        // this.cdRef.detectChanges();
      }
    );
    this.hwtForm.reset();
  }

  updateAvailableBalanceAndDailyTransferLimit() {
    if (this.selectedAccount) {
      this.selectedDebitAccount.availableBalance =
        this.selectedDebitAccount.availableBalance - this.tranAmount;

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

  // private notifyIntellinxTransfer() {
  //   const payload = this.buildNotifyIntellinxPayload();
  //   this.loaderIsActive = true;
  //   this.intellinxService.notifyIntellinx(payload).subscribe(
  //     (response) => {
  //       this.loaderIsActive = false;
  //       console.log(response);
  //     },
  //     (error) => {
  //       this.loaderIsActive = false;

  //       if (error && error.status != 401) {
  //         this.snackBar.open(Constants.APITechnicalErrorMessage, 'Ok', {
  //           verticalPosition: 'bottom',
  //           horizontalPosition: 'right',
  //           duration: 1500,
  //         });
  //       }
  //       // this.cdRef.detectChanges();
  //     }
  //   );
  // }

  // buildNotifyIntellinxPayload(): NotificationPaymentPayload {
  //   return {
  //     userId: VariablesService.UserId,
  //     sourceAccountNo: this.selectedDebitAccount.accountNumber,
  //     sourceAccountName: this.selectedDebitAccount.accountName,
  //     destinationAccountNo:
  //       this.selfTransferForm.controls['credited-account'].value,
  //     destinationAccountName: this.nameEnquiryDetails.destinationAccountName
  //       ? this.nameEnquiryDetails.destinationAccountName
  //       : '',
  //     destinationBankCode: Constants.StanbicBankCode,
  //     amount: this.getTotalAmountWithoutCharges(),
  //     sessionId: this.tranId,
  //     deviceCookie: this.deviceCookie,
  //     deviceUUID: this.deviceUUID,
  //     clientTimeZone: this.timeZone,
  //     senderNarration: this.selfTransferForm.get('narration').value,
  //     tranId: this.XTranId,
  //     xflre: this.XFLRE,
  //     cif: VariablesService.CifId,
  //     availableBalance: this.selectedDebitAccount.availableBalance,
  //     channel: 'IB',
  //     challengeSuccessful: this.challengeSuccessful,
  //   };
  // }

  // onSubmit() {
  //   this.timer = 0;
  //   this.otpService.clearTimer();
  //   this.minutes = 0;
  //   this.seconds = 0;
  // }

  onClearForm() {
    this.selfTransferForm.reset();
    this.selectedDebitAccount = null;
    this.selectedCreditAccount = null;
    this.selectedCategory = null;
    this.otpSendClicked = false;
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

  // confirmOtp() {
  //   this.stopTimer();
  //   const successDialogSub = this.dialog.open(SuccessDialogComponent, {
  //     data: { message: 'N100,000 successfully sent' },
  //     // disableClose: true
  //   });
  //   successDialogSub.afterClosed().subscribe(() => {
  //     this.page = 'form';
  //   });
  // }

  goBack() {
    this.page = 'form';
  }
}
