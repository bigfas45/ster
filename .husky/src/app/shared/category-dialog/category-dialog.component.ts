import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionCategoryService } from 'src/app/core/services/transaction-category.service';


@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryDialogComponent implements OnInit {

  constructor(private transactionsCat: TransactionCategoryService, public dialogRef: MatDialogRef<CategoryDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {

  }


  selectedCategory;

  categories;

  ngOnInit(): void {
    this.categories = this.transactionsCat.getTransactionsCategory();
  }

  categorySelect(categorySelection) {
    this.selectedCategory = categorySelection
    this.dialogRef.close(categorySelection.name)
  }


  closeDialog () {
    this.dialogRef.close(0);
  }


}
