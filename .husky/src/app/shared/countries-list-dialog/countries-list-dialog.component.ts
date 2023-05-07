import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Countries } from 'src/app/core/models/countries';
import { Country } from 'src/app/core/models/transaction.models';

@Component({
  selector: 'app-countries-list-dialog',
  templateUrl: './countries-list-dialog.component.html',
  styleUrls: ['./countries-list-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CountriesListDialogComponent implements OnInit {

  searchText: string;

  countries: Country [];

  constructor(
    public dialogRef: MatDialogRef<CountriesListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.countries = Countries.sort((a: Country, b: Country) => {
      if (a.countryName < b.countryName) return -1;
      if (a.countryName > b.countryName) return 1;
      return 0;
    });
  }

  countrySelect(selectedCountry:string){
    this.dialogRef.close(selectedCountry);

  }

    // filter(event) {
    //   console.log(event.target.value)
    // }

  filter(array, searchterm) {
    array.array.forEach(element => {

    });
  }

}
