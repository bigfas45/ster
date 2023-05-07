import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AssetUrlPipe } from 'src/app/core/pipes/asset.pipe';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { NavComponent } from './nav/nav.component';
import { RouterModule } from '@angular/router';
import { LayoutPmComponent } from './layout-pm/layout-pm.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BanksListDialogComponent } from './bankslist-dialog/bankslist-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { FilterPipe } from '../core/pipes/filter.pipe';
import { CountriesListDialogComponent } from './countries-list-dialog/countries-list-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OTPDialogComponent } from './otp/otp-dialog.component';

const AngularMaterialComps: any = [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatTableModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMenuModule,
  MatPaginatorModule,
  MatTabsModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressBarModule,
];

@NgModule({
  imports: [
    AngularMaterialComps,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
  ],
  declarations: [
    AssetUrlPipe,
    NavComponent,
    LayoutPmComponent,
    BanksListDialogComponent,
    CategoryDialogComponent,
    SuccessDialogComponent,
    DeleteDialogComponent,
    FilterPipe,
    CountriesListDialogComponent,
    OTPDialogComponent
  ],
  exports: [
    AssetUrlPipe,
    CommonModule,
    NavComponent,
    LayoutPmComponent,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialComps,
    BanksListDialogComponent,
    FontAwesomeModule,
    CategoryDialogComponent,
    FilterPipe,
    HttpClientModule,
    OTPDialogComponent
  ],
})
export class SharedModule {}
