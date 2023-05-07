import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import { Bank, Beneficiary } from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BanksListDialogComponent } from 'src/app/shared/bankslist-dialog/bankslist-dialog.component';
import { SuccessDialogComponent } from 'src/app/shared/success-dialog/success-dialog.component';
import { mockAccounts } from 'src/app/core/mock/accounts';
import { beneficiaries } from 'src/app/core/mock/beneficiaries';

@Component({
  selector: 'app-add-beneficiary',
  templateUrl: './add-beneficiary.component.html',
  styleUrls: ['./add-beneficiary.component.scss'],
})
export class AddBeneficiaryComponent implements OnInit {
  @ViewChild('otpForm', { static: false }) Otpform: FormGroup;
  selectedImage: any;
  beneficiaryPhoto: string = null;
  beneficiaryAccountTimer: any;
  nubanReturnsNonEmptyList: boolean;

  beneficiaryForm: FormGroup;
  hwtForm: FormGroup;
  beneficiarAccntNo: string;
  nameEnquirySub: Subscription;
  initiateOTPSub: Subscription;
  otpSendClicked: boolean = false;
  isCustomerHWTEnabled: boolean;
  timerSubscription: Subscription;
  createBeneficiarySub: Subscription;
  editBeneficiarySub: Subscription;
  beneficiaryListSub: Subscription;

  base64StrArr: any[] = [];
  otpReference: string;
  exceptionMessage: string;

  likelyBanks: Bank[];
  loaderIsActive: boolean = false;
  nameEnquiryDetails: any = null;
  nameEnquiryStatus: boolean = false;

  selectedBeneficiary;
  editMode: boolean = false;

  selectedBank: Bank;
  page: string;
  minutes: number;
  seconds: number;
  timer: number;

  notificationType: string;
  maskedOtpAddress: string;
  receipientAccountTimer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private miscService: MiscService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {}

  authData = JSON.parse(sessionStorage.getItem('authData'));
  userId = sessionStorage.getItem('userId');

  ngOnInit(): void {
    console.log('OnInt');
    this.page = 'form';
    this.hwtForm = new FormGroup({
      hwt: new FormControl(null, Validators.required),
    });
    this.beneficiaryForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      'account-number': new FormControl(null, [Validators.required]),
      bank: new FormControl(null, [Validators.required]),
    });

    this.route.params.subscribe((params: Params) => {
      if (isNaN(params['id'])) {
        return;
      }
      const beneficiaryId = +params['id'];

      if (params['id']) {
        this.setBeneficiaryOnLogin(params['id']);

        //this.beneficia.ries = beneficiaries;
        // console.log(StorageService.Banks);

        this.editMode = params['id'] != null;
      }
    });
  }

  onImageUpload(event) {
    let fileType = event.target.files[0].type;
    if (fileType.match(/image\/*/)) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.beneficiaryPhoto = event.target.result;
        console.log(this.beneficiaryPhoto);
      };
    } else {
      window.alert('Please select correct image format');
    }

    // const imagFile: File = event.target.files[0];
    // this.selectedImage= null;
    // const fileTypeError = this.validateFileType(imagFile);
    // if (fileTypeError) {
    //   this.snackBar.open(fileTypeError, 'OK', { duration: 15000 });
    //   return
    // }
    // if (imagFile.size / (1000 * 1024) > 2) {
    //   const error =
    //     'File size is more than 2 MB. Cannot files larger in size that 2MB';
    //   this.snackBar.open(error, 'Ok', { duration: 1500 });
    //   return;
    // }
    // this.selectedImage = imagFile;
    // console.log(this.selectedImage)
  }
  // imageUploadClicked(event) {
  //     const element = event.target as HTMLInputElement;
  //     element.value = '';
  // }
  // validateFileType(file: File): string {
  //   const fileSplit = file.name.split('.');
  //   const fileExtension = fileSplit[fileSplit.length - 1];
  //   switch (fileExtension) {
  //     case 'jpeg':
  //     case 'jpg':
  //     case 'png':
  //       return '';
  //     default:
  //       return `${file.name} is a not a valid type`;
  //   }
  // }

  otpNumberFormat() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\D/g, ''))
      : '';
  }

  nameFormatter() {
    const value = this.Otpform.controls['otp'].value;
    value
      ? this.Otpform.controls['otp'].setValue(value.replace(/\d/g, ''))
      : '';
  }

  setBeneficiaryOnLogin(id: number) {
    this.selectedBeneficiary = beneficiaries[id];
    this.beneficiaryForm
      .get('name')
      .setValue(this.selectedBeneficiary.beneficiaryAlias);
    this.beneficiaryForm
      .get('account-number')
      .setValue(this.selectedBeneficiary.beneficiaryAccountNumber);
    this.beneficiaryForm
      .get('bank')
      .setValue(this.selectedBeneficiary.beneficiaryBank);
    console.log(this.beneficiaryForm);
    if (StorageService.Banks && !this.selectedBank) {
      this.bankListLoop();
    }
  }

  setRecipientDetails() {
    clearTimeout(this.receipientAccountTimer);
    this.receipientAccountTimer = setTimeout(() => {
      if (
        this.beneficiaryForm.get('account-number').valid &&
        this.beneficiaryForm.get('bank').valid
      ) {
        this.nameEnquiryDetails = 'CONTENT';
      } else {
        this.nameEnquiryDetails = null;
      }
    }, 1000);
  }

  setBeneficiaryBankOnLogin() {
    if (StorageService.Banks) {
      this.bankListLoop();
    } else {
      this.transactionService.getBanks().subscribe(
        (response) => {
          if (
            response.ResponseCode === ResponseCodes.SUCCESS &&
            response.Banks &&
            response.Banks.length > 0
          ) {
            console.log('called');
            StorageService.Banks = response.Banks.slice();
            //this.bankListLoop();
          }
        },
        (error: any) => {
          this.snackBar.open('Error occured', 'Ok', { duration: 2000 });
        }
      );
    }
  }

  bankListLoop() {
    if (this.selectedBeneficiary) {
      StorageService.Banks.forEach((x) => {
        if (x.code === this.selectedBeneficiary.beneficiaryBankCode) {
          console.log(x);
          this.selectedBank = x;
        }
      });
    }
  }

  goBack() {
    if (this.page === 'otp') {
      this.stopTimer();
      this.page = 'form';
      return;
    }
    if (this.editMode == true) {
      this.router.navigate(['../../beneficiary-list'], {
        relativeTo: this.route,
      });
      return;
    }
    this.router.navigate(['../beneficiary-list'], { relativeTo: this.route });
  }

  onCancel() {
    this.stopTimer();
    this.page = 'form';
    this.onClearForm();
  }

  onClearForm() {
    this.beneficiaryForm.reset();
    this.selectedBeneficiary = null;
    this.otpSendClicked = false;
  }

  stopTimer() {
    this.timer = 0;
    this.miscService.clearTimer();
    this.minutes = 0;
    this.seconds = 0;
  }

  // addBeneficiary(event) {
  //   event.currentTarget.reset();
  //   this.beneficiaryForm.reset();
  // }

  bankSelect() {
    const bankListDialogSub = this.dialog.open(BanksListDialogComponent, {
      data: { selectedBank: '', likelyBanks: this.likelyBanks },
      // disableClose: true,
      backdropClass: 'blurred',
    });

    bankListDialogSub.afterClosed().subscribe((response) => {
      this.selectedBank = response;
      this.beneficiaryForm.get('bank').setValue(this.selectedBank.name);
      if (
        this.beneficiaryForm.get('bank').valid &&
        this.beneficiaryForm.get('account-number').valid
      ) {
        // this.doNameEnquiry();
      }
    });
  }

  setBeneficiaryDetails() {
    this.formatNumber('account-number');
    if (this.beneficiaryForm.get('account-number').valid) {
      this.beneficiarAccntNo = this.beneficiaryForm.get('account-number').value;

      this.transactionService.getNameEnquiry().subscribe(
        (response) => {
          if (response.isSuccess) {
            this.loaderIsActive = false;

            if (response.isSuccess) {
              console.log(response.content.accountname);
            }

            if (response.hasError) {
              this.snackBar.open(response.errorMessage, null, {
                verticalPosition: 'bottom',
                horizontalPosition: 'right',
                duration: 2000,
              });
            }
          } else {
            this.snackBar.open(response.errorMessage, null, {
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              duration: 2000,
            });
          }
        },
        (error) => {
          this.loaderIsActive = false;
          console.log(error);
          this.snackBar.open(error, null, {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 2000,
          });
        }
      );

      // if (beneficiaries.Banks) {
      //   let potentialBanks = this.miscService.nubanValidator(
      //     this.beneficiarAccntNo,
      //     StorageService.Banks
      //   );

      //   if (potentialBanks && potentialBanks.length > 0) {
      //     this.likelyBanks = potentialBanks.filter(
      //       (x) => x.code.length === 3
      //     );
      //     this.nubanReturnsNonEmptyList = true;
      //   } else {
      //     this.nubanReturnsNonEmptyList = false;
      //   }
      // }
    } else {
      this.beneficiarAccntNo = null;
    }
    if (
      this.beneficiaryForm.get('bank').valid &&
      this.beneficiaryForm.get('account-number').valid
    ) {
      //    this.doNameEnquiry();
    }
  }

  numberCheck(args) {
    if (args.key === 'e' || args.key === '+' || args.key === '-') {
      return false;
    } else {
      return true;
    }
  }

  getBeneficiaries(id: number) {
    //this.loaderIsActive = true;
    if (StorageService.Benficiaries) {
      this.loaderIsActive = false;
      this.setBeneficiaryOnLogin(id);
    }
    // this.beneficiaryListSub = this.transactionService
    //   .getBeneficiaries()
    //   .subscribe((response) => {
    //     this.loaderIsActive = false;
    //     if (response.ResponseCode == ResponseCodes.SUCCESS) {
    //       StorageService.Benficiaries = this.sortBeneficiaries(
    //         response.Beneficiaries
    //       );
    //       this.setBeneficiaryOnLogin(id);
    //     }
    //   });
  }

  sortBeneficiaries(beneficiaries): Beneficiary[] {
    return beneficiaries.sort((a: Beneficiary, b: Beneficiary) => {
      if (a.beneficiaryAlias < b.beneficiaryAlias) return -1;
      if (a.beneficiaryAlias > b.beneficiaryAlias) return 1;
      return 0;
    });
  }

  doNameEnquiry() {
    this.loaderIsActive = true;

    let transferMedium = 0;

    this.nameEnquirySub = this.transactionService
      .doNameEnquiry({
        UserId: StorageService.UserId,
        destinationAccountNo: this.beneficiarAccntNo,
        destinationBankCode: this.selectedBank.code,
        transferMedium: transferMedium,
        sourceAccountNo: StorageService.CustomerAccounts[0].accountNumber,
      })
      .subscribe(
        (response) => {
          this.loaderIsActive = false;

          if (response.ResponseCode === ResponseCodes.SUCCESS) {
            this.nameEnquiryDetails = response;
            this.nameEnquiryStatus = true;
          } else {
            console.log(this.nameEnquiryStatus);
            console.log(response.ResponseDescription);
            this.loaderIsActive = false;
            this.nameEnquiryStatus = false;
            this.snackBar.open('The Account Number entered is Invalid', 'Ok', {
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              duration: 2000,
            });
          }
        },
        (error: any) => {
          this.loaderIsActive = false;
        }
      );

    return false;
  }

  onValidateOneTimePasscode(useHardwareToken: boolean) {
    this.stopTimer();
    //this.loaderIsActive = true;

    const payload = {
      UserId: this.userId,
      purposeCode: 0,
      oneTimePassword: this.Otpform.controls['otp'].value,
    };
    this.transactionService.validateLoginOTP(payload).subscribe(
      (response) => {
        console.log(response);

        if (response.isSuccess) {
          // this.getAccountsByCIFID()

          if (this.editMode) {
            this.sendBeneficiarUpdateRequest();
          } else {
            this.sendCreateBeneficiaryRequest();
          }
        }

        if (response.hasError) {
          this.snackBar.open(response.errorMessage, null, {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 2000,
          });
        }
      },
      (error) => {
        console.log(error);
        this.snackBar.open(error, null, {
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          duration: 2000,
        });
      }
    );
  }

  formatName(input: string) {
    let value = this.beneficiaryForm.get(input).value;
    if (value) {
      this.beneficiaryForm.get(input).setValue(value.replace(/\d/g, ''));
    }
  }

  sendBeneficiarUpdateRequest() {
    const successDetail = `Beneficiary updated`;
    const successMsg = `account has been updated succesfully`;
    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: {
        successTitle: successDetail,
        message: successMsg,
        icon: 'done',
        description: 'success',
        downloadable: false,
      },
      backdropClass: 'blurred',
    });
    successDialogSub.afterClosed().subscribe(() => {
      this.router.navigate(['../../beneficiary-list'], {
        relativeTo: this.route,
      });
      // this.beneficiaryListSub = this.transactionService
      // .getBeneficiaries()              .subscribe((response) => {
      //   this.loaderIsActive = false;
      //   if (response.ResponseCode == ResponseCodes.SUCCESS) {
      //     StorageService.Benficiaries = this.sortBeneficiaries(
      //       response.Beneficiaries
      //     );
      //   }
      // });
    });

    // const payload = this.buildBeneficiaryUpdatePayload();
    // this.editBeneficiary(payload);
  }

  formatNumber(input: string) {
    let value = this.beneficiaryForm.get(input).value;
    if (value) {
      this.beneficiaryForm.get(input).setValue(value.replace(/\D/g, ''));
    }
  }

  editBeneficiary() {
    const successMsg = `${this.selectedBeneficiary.beneficiaryAlias} has been updated succesfully`;
    const successDialogSub = this.dialog.open(SuccessDialogComponent, {
      data: {
        message: successMsg,
        icon: 'done',
        description: 'success',
        downloadable: false,
      },
      backdropClass: 'blurred',
    });
    successDialogSub.afterClosed().subscribe(() => {
      // this.beneficiaryListSub = this.transactionService
      //   .getBeneficiaries()
      //   .subscribe((response) => {
      //     this.loaderIsActive = false;
      //     if (response.ResponseCode == ResponseCodes.SUCCESS) {
      //       StorageService.Benficiaries = this.sortBeneficiaries(
      //         response.Beneficiaries
      //       );
      //     }
      //   });
      this.router.navigate(['../../beneficiary-list'], {
        relativeTo: this.route,
      });
    });
  }

  sendCreateBeneficiaryRequest() {
    const payload = {
      bnfName: this.beneficiaryForm.get('name').value,
      accountNumber: this.userId,
      bnfNickName: this.beneficiaryForm.get('name').value,
      bnfAcctNumber: this.beneficiaryForm.get('account-number').value,
      customResponseBenAcctName: this.beneficiaryForm.get('name').value,
    };

    this.transactionService.addBeneficiary(payload).subscribe(
      (response) => {
        console.log(response);

        if (response.isSuccess) {
          const successDetail = `Beneficiary Added`;
          const successMsg = `Account has been added to your beneficiary list`;
          const successDialogSub = this.dialog.open(SuccessDialogComponent, {
            data: {
              successTitle: successDetail,
              message: successMsg,
              icon: 'done',
              description: 'success',
              downloadable: false,
            },
            backdropClass: 'blurred',
          });

          successDialogSub.afterClosed().subscribe(() => {
            this.onClearForm();
            this.router.navigate(['../beneficiary-list'], {
              relativeTo: this.route,
            });
          });
        }

        if (response.hasError) {
          this.snackBar.open(response.errorMessage, null, {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 2000,
          });
        }
      },
      (error) => {
        console.log(error);
        this.snackBar.open(error, null, {
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          duration: 2000,
        });
      }
    );
  }

  buildBeneficiaryUpdatePayload() {
    return {
      sessionId: this.miscService.generateSessionId(),
      UserId: StorageService.UserId,
      beneficiaryReference: this.beneficiaryForm.get('name').value,
      OTP:
        this.page != 'otp'
          ? this.hwtForm.controls.hwt.value
          : this.Otpform.controls.otp.value,
      BeneficiaryId: this.selectedBeneficiary.beneficiaryId,
      SourceReferenceId: this.otpReference,
      customerReference: this.beneficiaryForm.get('name').value,
      oBeneficiaryId: this.selectedBeneficiary.beneficiaryId,
      nBeneficiaryId: this.selectedBeneficiary.Id,
      BeneficiaryName: this.selectedBeneficiary.beneficiaryAlias,
    };
  }

  buildNewBeneficiaryRequestPayload() {
    let email = '';
    return {
      sessionId: this.miscService.generateSessionId(),
      userId: StorageService.UserId,
      beneficiaryAlias: this.beneficiaryForm.get('name').value,
      beneficiaryName: this.nameEnquiryDetails.destinationAccountName,
      beneficiaryAccountNumber:
        this.beneficiaryForm.get('account-number').value,
      beneficiaryBank: this.selectedBank.name,
      beneficiaryBankCode: this.selectedBank.code,
      beneficiaryEmailAddress: email,
      beneficiaryReference: this.beneficiaryForm.get('name').value,
      customerReference: this.beneficiaryForm.get('name').value,
      otp:
        this.page != 'otp'
          ? this.hwtForm.controls.hwt.value
          : this.Otpform.controls.otp.value,
      otpReference: this.otpReference,
    };
  }

  createBeneficiary(payload) {
    const payloadGetBen = {
      accountNumber: this.userId,
    };
    this.loaderIsActive = true;
    this.createBeneficiarySub = this.transactionService
      .addBeneficiary(payload)
      .subscribe(
        (response) => {
          this.loaderIsActive = false;
          if (
            response &&
            response.ResponseCode &&
            response.ResponseCode === ResponseCodes.SUCCESS
          ) {
            const successMsg = `${this.nameEnquiryDetails.destinationAccountName} has been added to your beneficiary list`;
            const successDialogSub = this.dialog.open(SuccessDialogComponent, {
              data: {
                message: successMsg,
                icon: 'done',
                description: 'success',
                downloadable: false,
              },
              backdropClass: 'blurred',
            });
            successDialogSub.afterClosed().subscribe(() => {
              this.beneficiaryListSub = this.transactionService
                .getBeneficiaries()
                .subscribe((response) => {
                  this.loaderIsActive = false;
                  if (response.ResponseCode == ResponseCodes.SUCCESS) {
                    StorageService.Benficiaries = this.sortBeneficiaries(
                      response.Beneficiaries
                    );
                  }
                });
              this.onClearForm();
              this.router.navigate(['../beneficiary-list'], {
                relativeTo: this.route,
              });
            });
            return;
          }
          this.exceptionMessage = response.ResponseFriendlyMessage;
          const successDialogSub = this.dialog.open(SuccessDialogComponent, {
            data: {
              message: this.exceptionMessage,
              icon: 'close',
              description: 'failed',
              downloadable: false,
            },
            disableClose: true,
            backdropClass: 'blurred',
          });
          successDialogSub.afterClosed().subscribe(() => {
            this.onClearForm();
            this.router.navigate(['../beneficiary-list'], {
              relativeTo: this.route,
            });
          });
        },
        (error) => {
          this.loaderIsActive = false;
          if (error && error.status != 401) {
            const successDialogSub = this.dialog.open(SuccessDialogComponent, {
              data: {
                message:
                  'Your request cannot be completed at the moment due to a technical error, please try again later.',
                icon: 'close',
                description: 'failed',
              },
              disableClose: true,
              backdropClass: 'blurred',
            });
            successDialogSub.afterClosed().subscribe(() => {
              this.onClearForm();
              this.router.navigate(['../beneficiary-list'], {
                relativeTo: this.route,
              });
            });
          }
        }
      );
  }

  sendOtp(event, status) {
    this.otpSendClicked = true;
    console.log(this.beneficiaryForm.invalid);

    if (this.beneficiaryForm.invalid) {
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

    this.snackBar.open(
      `Please enter the One Time Code sent to you
      `,
      'OK',
      { duration: 2000 }
    );

    if (status == 'resend') {
      this.snackBar.open(
        `Please enter the One Time Code sent to you
`,
        'OK',
        { duration: 2000 }
      );
    }
  }
  ToBase64(file: File): any {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  ConvertToBase64(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}
