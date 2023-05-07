import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponseCodes } from 'src/app/core/Enumeration';
import { Beneficiary } from 'src/app/core/models/transaction.models';
import { MiscService } from 'src/app/core/services/miscService';
import { StorageService } from 'src/app/core/services/storage.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OTPDialogComponent } from 'src/app/shared/otp/otp-dialog.component';
import { beneficiaries } from 'src/app/core/mock/beneficiaries';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-beneficiary-list',
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.scss'],
})
export class BeneficiaryListComponent implements OnInit {
  beneficiaries: Beneficiary[];
  beneficiaryListSub: Subscription;
  loaderIsActive: boolean = false;
  selectedBeneficiary: Beneficiary;
  userId = sessionStorage.getItem('userId');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private transactionService: TransactionService,
    private miscService: MiscService,
    private _snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // this.beneficiaries = beneficiaries;
    this.getBeneficiaries();
  }

  goBack() {
    this.router.navigate(['../../transfers/transfer-beneficiairies'], {
      relativeTo: this.route,
    });
  }

  getBeneficiaries() {
    this.loaderIsActive = true;

    this.beneficiaryListSub = this.transactionService
      .getBeneficiaries()
      .subscribe((response) => {});

    this.transactionService.getBeneficiaries().subscribe(
      (response) => {
        if (response.isSuccess) {
          this.loaderIsActive = false;

          if (response.isSuccess) {
            this.beneficiaries =  response.content.customCounterPartyList

            console.log(response.content
              );
          }

          if (response.hasError) {
            this._snackbar.open(response.errorMessage, null, {
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              duration: 2000,
            });
          }
        } else {
          this._snackbar.open(response.errorMessage, null, {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 2000,
          });
        }
      },
      (error) => {
        this.loaderIsActive = false;
        console.log(error);
        this._snackbar.open(error, null, {
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          duration: 2000,
        });
      }
    );
  }

  sortBeneficiaries(beneficiaries): Beneficiary[] {
    return beneficiaries.sort((a: Beneficiary, b: Beneficiary) => {
      if (a.beneficiaryAlias < b.beneficiaryAlias) return -1;
      if (a.beneficiaryAlias > b.beneficiaryAlias) return 1;
      return 0;
    });
  }

  editBeneficiary(beneficiaryId: number) {
    this.router.navigate(['../add-beneficiary', beneficiaryId], {
      relativeTo: this.route,
    });
  }

  addBeneficiary() {
    this.router.navigate(['../add-beneficiary'], { relativeTo: this.route });
  }

  deleteBeneficiary(beneficiary: Beneficiary) {
    const otpDialogSub = this.dialog.open(OTPDialogComponent, {
      data: {
        type: 'delete',
        beneficiary: beneficiary,
        //payload: payload,
        dialogAction: this.sendBeneficiaryDeleteRequest,
        successMessage: `${beneficiary.beneficiaryAlias} has been removed from your beneficiaries`,
        succesTitle: 'Beneficiary Deleted',
      },
      disableClose: true,
      backdropClass: 'blurred',
    });

    // const payload = {
    //   UserId: StorageService.UserId,
    //   SessionId: this.miscService.generateSessionId(),
    //   BeneficiaryId: beneficiary.beneficiaryId,
    // };
    // const otpDialogSub = this.dialog.open(OTPDialogComponent, {
    //   data: {
    //     type: 'delete',
    //     beneficiary: beneficiary,
    //    // payload: payload,
    //     dialogAction: this.sendBeneficiaryDeleteRequest,
    //     successMessage: `${beneficiary.beneficiaryAlias} has been removed from your beneficiaries`,
    //     succesTitle: 'Beneficiary Added'
    //   },
    //   disableClose: true,
    //   backdropClass: 'blurred',
    // });

    otpDialogSub.afterClosed().subscribe((response) => {
      //this.loaderIsActive = true;
      //this.beneficiaryListSub = this.transactionService
      // .getBeneficiaries()
      // .subscribe((response) => {
      //   this.loaderIsActive = false;
      //   if (response.ResponseCode == ResponseCodes.SUCCESS) {
      //     StorageService.Benficiaries = this.sortBeneficiaries(
      //       response.Beneficiaries
      //     );
      //     console.log(StorageService.Benficiaries);
      //     this.beneficiaries = StorageService.Benficiaries.slice();
      //     return;
      //   }
      //   if (response.ResponseDescription === 'No records fetched') {
      //     console.log(response);
      //     StorageService.Benficiaries = [];
      //     this.beneficiaries = [];
      //   }
      //});
    });
  }

  sendBeneficiaryDeleteRequest(payload: any, service: any) {
    return service.removeBeneficiary(payload);
  }
}
