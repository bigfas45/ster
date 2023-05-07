import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BanksListDialogComponent } from '../bankslist-dialog/bankslist-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MiscService } from 'src/app/core/services/miscService';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.scss'],
})
export class SuccessDialogComponent implements OnInit {
  @ViewChild('downloadContent', { static: false }) downloadContent: ElementRef;

  download: boolean = false;
  successMsg: boolean = true;
  successDetail: boolean = true;
  icon: string;
  width;
  height;
  downloadButton: boolean = true;

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  successTitle: string;
  message: string;

  constructor(public dialogRef: MatDialogRef<SuccessDialogComponent>, private miscService: MiscService,
    @Inject(MAT_DIALOG_DATA) public data: any, private snackbar: MatSnackBar) {}

  ngOnInit(): void {
    if(this.data.action) {
      this.generatepdf ()
    }

    if (this.data.downloadable === false ) {
      this.downloadButton = false;
    }

    console.log("fhfhfhfh", this.data.successTitle);

    if (this.data.description) {
      this.message = this.data.message;
      this.successTitle = this.data.successTitle;
 
      this.icon = this.data.icon;
      console.log(this.data)
    }

  }

  ngAfterInit() {

  }

  generatepdf () {
    this.successMsg = false;
    this.download = true;

    this.snackbar.open( "Downloading...", "", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
    });

    setTimeout(()=> {
      let pdf = new jsPDF('p', 'pt','a4');
      pdf.html(this.downloadContent.nativeElement, {
        callback: (pdf) => {
          pdf.save("receipt.pdf");
        }
      });
      this.width = pdf .internal.pageSize.getWidth();
this.height = pdf .internal.pageSize.getHeight();
    }, 2000)


  }




downloadFile(): void {

this.snackbar.open( "Downlaoding file...", "", {

horizontalPosition: this.horizontalPosition,

verticalPosition: this.verticalPosition,

duration: 1500,

});

this.miscService

.downloadFileAsBlob('Receipt.pdf')

.subscribe(blob => {

const a = document.createElement('a')

const objectUrl = window.URL.createObjectURL(blob)

a.href = objectUrl

a.download = 'Receipt.pdf';

a.click();

window.URL.revokeObjectURL(objectUrl);

})

}
}
