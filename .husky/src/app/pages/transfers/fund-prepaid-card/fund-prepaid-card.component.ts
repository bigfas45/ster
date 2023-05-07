import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import {
  CustomerAccount,
  DailyTransferLimits,
} from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OTPDialogComponent } from 'src/app/shared/otp/otp-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';

@Component({
  selector: 'app-fund-prepaid-card',
  templateUrl: './fund-prepaid-card.component.html',
  styleUrls: ['./fund-prepaid-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FundPrepaidCardComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  
  loaderIsActive: boolean = false;
  page: string = 'customer-details';
  customerDetailsForm: FormGroup;
  cardFundingDetailsForm: FormGroup;
  nextButtonClicked: boolean = false;
  selectedCardType: string = null;
  cardTypes: string[] = ['Master Card', 'Visa '];
  availableBalance: number;
  insufficientFund: boolean = false;
  insufficientFundTimer: any;
  transactionCurrency: string;
  dailyTransferLimits: DailyTransferLimits;
  amountUtilizedFromLimit: number;
  availableLimit: number;
  withinDailyLimit: boolean;
  amountValue: string;
  minutes: number;
  seconds: number;
  timer: number;
  initiateOTPSub: Subscription;
  timerSubscription: Subscription;
  otpTimerData: { minutes: any; seconds: any; timer: any };
  otpReference: string;
  pageStep:number = 1;

  accountList: Array<CustomerAccount> = [];
  prepaidCardFormDetail: {
    customerId: string;
    cardType: string;
    preferredName: string;
    accountToDebit: CustomerAccount;
    amount: string;
    narration: string;
    cardNumber: string;
  } = {
    customerId: null,
    cardType: null,
    preferredName: null,
    accountToDebit: null,
    amount: null,
    narration: null,
    cardNumber: null,
  };

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private transactionService: TransactionService,
    private miscService: MiscService
  ) {}

  ngOnInit(): void {
    this.formsInitialization();
    this.accountList = mockAccounts;
  }

  formsInitialization() {

    this.customerDetailsForm = new FormGroup({
      customer_id: new FormControl(null, [Validators.required]),
      card_type: new FormControl(null, [Validators.required]),
    });
    this.cardFundingDetailsForm = new FormGroup({
      pref_name: new FormControl(null, [Validators.required]),
      debit_account: new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      narration: new FormControl(null, [Validators.required]),
      card_number: new FormControl(null, [Validators.required]),
    });
  }

  nextStage(stage: string) {
    switch (stage) {
      case 'customer-details':
        console.log(this.customerDetailsForm);
        this.page = 'card-details';
        this.pageStep = 2;
        break;
      case 'card-details':
        console.log(this.cardFundingDetailsForm);
        this.initiateOtp();
        this.pageStep = 3;
        break;
        // case 'card-details':
        // console.log(this.cardFundingDetailsForm);
        // this.initiateOtp();
        // break;
    }
  }

  // initiateOtp(){

  // }

  formatName(input: string) {
    let value = this.cardFundingDetailsForm.get(input).value;
    if (value) {
      this.cardFundingDetailsForm.get(input).setValue(value.replace(/\d/g, ''));
    }
  
  }
  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  formatNumber(form: string) {
    let value: String;
    switch (form) {
      case 'customer-details':
        value = this.customerDetailsForm.controls['customer_id'].value;
        value
          ? this.customerDetailsForm.controls['customer_id'].setValue(
              value.replace(/\D/g, '')
            )
          : '';
        // this.commaFormat()
        break;
      case 'amount':
        value = this.cardFundingDetailsForm.controls[form].value;
        if (value) {
          this.cardFundingDetailsForm.controls[form].setValue(
            value.replace(/\D/g, '')
          );
          this.commaFormat();
          break;
        }
        break;
      default:
        value = this.cardFundingDetailsForm.controls[form].value;
        value
          ? this.cardFundingDetailsForm.controls[form].setValue(
              value.replace(/\D/g, '')
            )
          : '';
    }
  }


  goBack(){

  }

numberCheck(){

}
  commaFormat() {
    const value = this.cardFundingDetailsForm.controls['amount'].value.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ','
    );
    this.cardFundingDetailsForm.controls['amount'].setValue(value);
  }

  cardTypeSelect(index: number) {
    this.prepaidCardFormDetail.cardType = this.cardTypes[index];
    this.customerDetailsForm
      .get('card_type')
      .setValue(this.prepaidCardFormDetail.cardType);
  }

  onAccountSelect(index: number) {
    this.prepaidCardFormDetail.accountToDebit = this.accountList[index];
    this.cardFundingDetailsForm
      .get('debit_account')
      .setValue(this.prepaidCardFormDetail.accountToDebit.accountNumber);
    this.availableBalance =
      this.prepaidCardFormDetail.accountToDebit.availableBalance;
    if (this.cardFundingDetailsForm.get('amount').valid) {
      this.revalidateAmount();
    }
  }

  revalidateAmount() {
    let amountValid = true;
    let amount = +this.cardFundingDetailsForm
      .get('amount')
      .value.replace(/,/g, '');
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
    let amountEntered = this.cardFundingDetailsForm.get('amount').value;

    if (amountEntered) {
      if ((amountEntered as string).indexOf('.00') != -1) {
        amountEntered = (amountEntered as string).replace('.00', '');
      }

      amountEntered = amountEntered.replace(/,/g, '');
    }

    return +amountEntered;
  }

  initiateOtp() {



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

  //   if (status == 'resend') {
  //     this.snackBar.open(
  // `Please enter the One Time Code sent to you`,
  //           'OK',
  //            { duration: 2000 }
  //               );
  //   }
  //  this.loaderIsActive = true;
    // this.initiateOTPSub = this.transactionService
    //   .initiateOtpRequest({
    //     UserId: StorageService.UserId,
    //     CifId: StorageService.CifId,
    //     ReasonCode: '08',
    //   })
    //   .subscribe(
    //     (response) => {
    //       this.loaderIsActive = false;

    //       if (
    //         response.ResponseCode &&
    //         response.ResponseCode === ResponseCodes.SUCCESS
    //       ) {
           

    //     // this.otpReference = response.ResponseDescription;

    //         this.snackBar.open(
    //           `Please enter the One Time Code sent to you
    // `,
    //           'OK',
    //           { duration: 2000 }
    //         );
    //         // const otpDialogSub = this.dialog.open(OTPDialogComponent, {
    //         //   data: {
    //         //     type: 'fund-prepaid-card',
    //         //     // timerData: this.otpTimerData,
    //         //     otpRef: this.otpReference,
    //         //     successMessage:
    //         //       'You have successfully funded your request card.',
    //         //     succesTitle: 'Request Card Funded',
    //         //   },
    //         //   disableClose: true,
    //         //   backdropClass: 'blurred',
    //         // });''

    //         return;
    //       }
    //       this.snackBar.open(response.ResponseFriendlyMessage, 'OK', {
    //         duration: 2000,
    //       });

    //       // this.exceptionMessage = response.ResponseFriendlyMessage;
    //     },
    //     // (error: any) => {
    //     //   this.loaderIsActive = false;
    //     //   if (error && error.status != 401) {
    //     //     this.snackBar.open(
    //     //       'Your request cannot be completed at the moment due to a technical error, please try again later.',
    //     //       'OK',
    //     //       { duration: 2000 }
    //     //     );
    //     //   }
    //     // }
    //   );
  }
  // sendOtp(){
  //   this.snackBar.open(
  //             `Please enter the One Time Code sent to you
  //     `,
  //              'OK',
  //            { duration: 2000 }
  //          );
  // }

  onValidateOneTimePasscode(){
    const successDetail = `Transaction Successful`;
                
    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: {
        successTitle: successDetail,
        message: `Card successfully Funded `,
        icon: 'done',
        description: 'success',
      },
      backdropClass: 'blurred',
    });
    successDialogSub.afterClosed().subscribe(() => {
      this.onClearForm();
      this.page = 'customer-details';
  
    });
   }


  onCancel(page: string) {
    switch (page) {
      case 'card-details':
        this.page = 'customer-details';
        this.pageStep = 1;
        break;
      case 'customer-details':
        this.onClearForm();
        break;
      case 'otp':
        this.stopTimer();
        this.page = 'card-details';
        this.pageStep = 2;
    }
  }

  stopTimer() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }
  onClearForm() {
    this.customerDetailsForm.reset();
    this.prepaidCardFormDetail = {
      customerId: null,
      cardType: null,
      preferredName: null,
      accountToDebit: null,
      amount: null,
      narration: null,
      cardNumber: null,
    };
  }
}
