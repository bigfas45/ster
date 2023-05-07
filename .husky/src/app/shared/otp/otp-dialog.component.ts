import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import { Beneficiary } from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OTPDialogComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;

  minutes: number;
  seconds: number;
  timer: number;
  page: string = 'otp';
  message: string;
  timerSubscription: Subscription;
  successStatus: string;
  loaderIsActive: boolean = false;
  initiateOTPSub: Subscription;
  otpReference: string;
  exceptionMessage: string;
  notificationType: string;
  maskedOtpAddress: string;
  selectedBeneficiary: Beneficiary;
  removeBeneficiarySub: Subscription;
  actionPayload: any;
  confirmFunction: any;
  successMessage: string;
  succesTitle: string;
  pageType: string;

  constructor(
    public dialogRef: MatDialogRef<OTPDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private miscService: MiscService,
    private router: Router,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pageType = this.data.type;
    if (this.data.type === 'delete') {
      this.page = 'delete';
    } else {
      this.miscService.setTimer();
      this.timerSubscription = this.miscService.timeValues.subscribe(
        (timeData) => {
          this.minutes = timeData.minutes;
          this.seconds = timeData.seconds;
          this.timer = timeData.timer;
        }
      );
    }
    if (this.data.beneficiary) {
      this.selectedBeneficiary = this.data.beneficiary;
    }
    this.actionPayload = this.data.payload;
    this.confirmFunction = this.data.dialogAction;
    this.successMessage = this.data.successMessage;
    this.succesTitle = this.data.succesTitle;

    // this.miscService.setTimer();
    // this.timerSubscription = this.miscService.timeValues.subscribe((timeData) => {
    //   this.minutes = timeData.minutes;
    //   this.seconds = timeData.seconds;
    //   this.timer = timeData.timer;
    // })
    // this.transactionMssge = this.data.message;
    // this.successStatus = this.data.status;
  }

  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  
  sendOtp() {
    // this.page = 'otp';
    // this.msicService.setTimer()
    this.page = 'otp';
    this.stopTimer();
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
    // this.maskedOtpAddress = response.NotificationAddress;
    // this.actionPayload['SourceReferenceId'] = this.otpReference;

    this.snackBar.open(
      `Please enter the One Time Code sent to you
`,
      'OK',
      { duration: 2000 }
    );

    return;
    // this.loaderIsActive = true;
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
    //         this.page = 'otp';
    //         this.stopTimer();
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
    //         this.actionPayload['SourceReferenceId'] = this.otpReference;

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
  }

  // onSubmit() {
  //   this.miscService.clearTimer();
  //   this.page = 'success';
  // }

  closeDialog() {
    this.dialogRef.close();
  }

  onCancel() {
    this.stopTimer();
    this.dialogRef.close();
  }

  stopTimer() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;
    // this.actionPayload['OTP'] = this.Otpform.controls.otp.value;
    this.otpConfirmAction();
  }

  // buildBeneficiaryDeleteRequestPayload() {
  //   return {
  //     UserId: StorageService.UserId,
  //     SessionId:this.miscService.generateSessionId(),
  //     OTP: this.Otpform.controls.otp.value,
  //     BeneficiaryId: this.selectedBeneficiary.beneficiaryId,
  //     SourceReferenceId: this.otpReference
  //   };
  // }

  private otpConfirmAction() {
   // this.loaderIsActive = true;
   this.page = 'action-status-page';

   this.successStatus = 'success';
   this.message = this.successMessage;
    // this.removeBeneficiarySub = this.confirmFunction(
    //   this.actionPayload,
    //   this.transactionService
    // ).subscribe(
    //   (response) => {
    //     this.loaderIsActive = false;
    //     this.page = 'action-status-page';
    //     if (
    //       response &&
    //       response.ResponseCode &&
    //       response.ResponseCode === ResponseCodes.SUCCESS
    //     ) {
    //       this.successStatus = 'success';
    //       this.message = this.successMessage;
    //       return;
    //     }
    //     this.successStatus = 'fail';
    //     this.message = response.ResponseFriendlyMessage;
    //   },
    //   (error) => {
    //     this.loaderIsActive = false;
    //     this.successStatus = 'fail';
    //     this.message =
    //       'Your request cannot be completed at the moment due to a technical error, please try again later';
    //   }
    // );
  }
}
