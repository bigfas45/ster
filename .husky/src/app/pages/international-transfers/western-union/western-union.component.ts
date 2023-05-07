import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import {
  Country,
  CustomerAccount,
  DailyTransferLimits,
  WesternUnionRedemptionRequestPayload,
} from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CountriesListDialogComponent } from 'src/app/shared/countries-list-dialog/countries-list-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';

@Component({
  selector: 'app-western-union',
  templateUrl: './western-union.component.html',
  styleUrls: ['./western-union.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class WesternUnionComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  otpSendClicked: boolean = false;
  loaderIsActive: boolean = false;
  isCustomerHWTEnabled: boolean;

  hwtForm: FormGroup;

  westernUnionForm: FormGroup;

  selectedQuestion: string;

  selectedAccount: CustomerAccount;

  selectedCountry: Country;
  selectedCategory: string;
  amountValue: string;
  MTCNValue: string;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;
  timerSubscription: Subscription;
  availableBalance: number;
  insufficientFund: boolean;
  insufficientFundTimer: ReturnType<typeof setTimeout>;
  dailyTransferLimits: DailyTransferLimits;
  availableLimit: number;
  amountUtilizedFromLimit: number;
  withinDailyLimit: boolean;
  transAmountTimeout: ReturnType<typeof setTimeout>;
  tranAmount: number;
  initiateOTPSub: Subscription;
  otpReference: string;
  notificationType: string;
  maskedOtpAddress: string;
  exceptionMessage: string;
  tranId: string;
  westernUnionRedempSubscription: Subscription;

  accountList: CustomerAccount[];

  // securityQuestions = ['Question1', 'Question2', 'Question3', 'Question4'];

  constructor(
    public dialog: MatDialog,
    private miscService: MiscService,
    private snackBar: MatSnackBar,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.westernUnionForm = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
      mtcn: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      // 'security-question': new FormControl(null, [Validators.required]),
      'question-answer': new FormControl(null, [Validators.required]),
      'redemption-account': new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
    });

    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });
    this.page = 'form';
  
    this.accountList = mockAccounts;
  }

  onAccountSelect(index: number) {
    this.selectedAccount = this.accountList[index];
    this.westernUnionForm
      .get('redemption-account')
      .setValue(this.selectedAccount.accountNumber);
    this.availableBalance = this.selectedAccount.availableBalance;

    this.amountInputValidation();
  }

  // onQuestionSelect(index: number) {
  //   this.selectedQuestion = this.securityQuestions[index];
  //   this.westernUnionForm
  //     .get('security-question')
  //     .setValue(this.selectedQuestion);
  // }


  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  formatNumber(input: string) {
    let value = this.westernUnionForm.get(input).value;
    if (value) {
      this.westernUnionForm.get(input).setValue(value.replace(/\D/g, ''));
    }
  }

  commaFormat() {
    this.formatNumber('amount');
    this.amountValue = this.westernUnionForm
      .get('amount')
      .value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  amountInputValidation() {
    this.commaFormat();
    let amount = (this.tranAmount = +this.westernUnionForm
      .get('amount')
      .value.replace(/,/g, ''));
    // if (this.availableBalance && this.selectedAccount) {
    //   // this.revalidateAmount();
    // }
  }

  // revalidateAmount() {
  //   let amountValid = true;
  //   let amount = (this.tranAmount = +this.westernUnionForm
  //     .get('amount')
  //     .value.replace(/,/g, ''));

  //   if (
  //     this.dailyTransferLimits &&
  //     this.dailyTransferLimits.limitApplicable.toLowerCase() == 'y'
  //   ) {
  //     this.availableLimit = +this.dailyTransferLimits.totalDailyLimits;

  //     this.amountUtilizedFromLimit =
  //       +this.dailyTransferLimits.totalDailyLimits -
  //       +this.dailyTransferLimits.dailyLimitsAvailable;

  //     if (amount > +this.dailyTransferLimits.dailyLimitsAvailable) {
  //       this.withinDailyLimit = false;
  //       amountValid = false;
  //     } else {
  //       this.withinDailyLimit = true;
  //     }
  //   } else {
  //     this.withinDailyLimit = true;
  //   }

  //   return amountValid;
  // }

  // updateAvailableBalanceAndDailyTransferLimit() {
  //   if (this.selectedAccount) {
  //     this.selectedAccount.availableBalance =
  //       this.selectedAccount.availableBalance - this.tranAmount;

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

  countrySelect() {
    const countryListDialogSub = this.dialog.open(
      CountriesListDialogComponent,
      {
        data: { selectedCountry: '' },
        disableClose: true,
        backdropClass: 'blurred',
      }
    );

    countryListDialogSub.afterClosed().subscribe((response) => {
      console.log(response);
      this.selectedCountry = response;
      this.westernUnionForm
        .get('country')
        .setValue(this.selectedCountry.countryName);
    });
  }

  sendOtp( status) {
    console.log(this.westernUnionForm);

    this.otpSendClicked = true;

   
    if (this.westernUnionForm.invalid) {
      return;
    }
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

   // this.otpReference = response.ResponseDescription;
   // this.notificationType = response.NotificationType;
    //this.maskedOtpAddress = response.NotificationAddress;

    this.snackBar.open(
      `Please enter the One Time Code sent to you
`,
      'OK',
      { duration: 2000 }
    );

    return;

    // if (this.tranAmount > this.availableBalance) {
    //   this.snackBar.open('You have an insufficient balance.', 'OK', {
    //     duration: 1000,
    //   });
    //   return;
    // }
    //this.loaderIsActive = true;

    // if (this.isCustomerHWTEnabled) {
    //   this.page = 'hwt';
    //   return;
    // } else {
    //   this.initiateOTPSub = this.transactionService
    //     .initiateOtpRequest({
    //       UserId: StorageService.UserId,
    //       CifId: StorageService.CifId,
    //       ReasonCode: '05',
    //     })
    //     .subscribe(
    //       (response) => {
    //         this.loaderIsActive = false;

    //         if (
    //           response.ResponseCode &&
    //           response.ResponseCode === ResponseCodes.SUCCESS
    //         ) {
    //           this.page = 'otp';
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

    //   // comment out once api starts working
    // }
  }

  onSubmit() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
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

  onClearForm() {
    this.westernUnionForm.reset();
    this.selectedAccount = null;
    this.selectedCountry = null;
    this.selectedCategory = null;
    this.otpSendClicked = false;
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
      this.westernUnionForm.reset();
      this.selectedAccount = null;
      this.selectedCountry = null;
      this.selectedCategory = null;
    });
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;
    //this.tranId = this.miscService.generateSessionId();

    const successDetail = `Transaction Successful`;

    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: {
        successTitle: successDetail,
        message: `Redemption Successful `,
        icon: 'done',
        description: 'success',
      },
      backdropClass: 'blurred',
    });
    successDialogSub.afterClosed().subscribe(() => {
      this.onClearForm();
      this.page = 'form';
      this.amountValue = '';
      this.MTCNValue = '';
    });

    return;

    // const payload = {
    //   amount: this.westernUnionForm.get('amount').value,
    //   amountValue: this.westernUnionForm.get('amount').value,
    //   testAnswer: this.westernUnionForm.get('question-answer').value,
    //   creditAcct: this.selectedAccount.accountNumber,
    //   mtcnNumber: this.westernUnionForm.get('mtcn').value,
    //   redemptionCurrency: 'NGN',
    //   redemptionCountryCode: this.selectedCountry.isoCode,
    //   mobilePhoneNo: this.westernUnionForm.get('phone').value,
    //   otp:
    //     this.page != 'otp'
    //       ? this.hwtForm.controls.hwt.value
    //       : this.Otpform.controls.otp.value,
    //   // SessionId: this.tranId,
    //   // userId: StorageService.UserId,
    //   // SourceReferenceId: this.otpReference,
    //   // lastname: StorageService.UserDeatils.Lastname,
    //   // firstname: StorageService.UserDeatils.Firstname,
    //   // sourceAccountCurrency: this.selectedAccount.currency,
    //   // OTPType: 0,
    // };

    //this.initiateRedemption(payload);
  }

  // initiateRedemption(payload: WesternUnionRedemptionRequestPayload) {
  //   this.westernUnionRedempSubscription = this.transactionService
  //     .doWesternUnionRedemption(payload)
      // .subscribe(
      //   (response) => {
      //     this.loaderIsActive = false;

      //     // if (
      //     //   response.ResponseCode &&
      //     //   response.ResponseCode === ResponseCodes.SUCCESS
      //     // ) {
      //     //   const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      //     //     data: {
      //     //       message: `Redemption Successful `,
      //     //       icon: 'done',
      //     //       description: 'success',
      //     //     },
      //     //     backdropClass: 'blurred',
      //     //   });
      //     //   successDialogSub.afterClosed().subscribe(() => {
      //     //     this.onClearForm();
      //     //     this.page = 'form';
      //     //   });

      //     //   return;
      //     // }

      //     // if (
      //     //   response.transactionId == null ||
      //     //   (response.transactionId &&
      //     //     response.transactionId.includes('-999-')) ||
      //     //   response.transactionId == 'null'
      //     // ) {
      //     //   response.transactionId = payload.SessionId;
      //     //   const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      //     //     data: {
      //     //       message: response.ResponseDescription,
      //     //       icon: 'close',
      //     //       description: 'failed',
      //     //     },
      //     //     backdropClass: 'blurred',
      //     //   });
      //     //   // successDialogSub.afterClosed().subscribe(() => {
      //     //   //   this.onClearForm();
      //     //   //   this.page = 'form';
      //     //   // });
      //     // }

      //     //this.exceptionMessage = response.ResponseFriendlyMessage;
      //   },
      //   // (error: any) => {
      //   //   this.loaderIsActive = false;
      //   //   if (error && error.status != 401) {
      //   //     this.exceptionMessage =
      //   //       'Your request cannot be completed at the moment due to a technical error, please try again later.';
      //   //   }
      //   //   this.page = 'form';
      //   // }
      // );
  //}

  goBack() {
    this.page = 'form';
  }
}
