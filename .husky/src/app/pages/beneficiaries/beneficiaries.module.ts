import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BeneficiariesRoutingModule } from './beneficiaries-routing.module';
import { BeneficiaryListComponent } from './beneficiary-list/beneficiary-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BeneficiariesComponent } from './beneficiaries.component';
import { AddBeneficiaryComponent } from './add-beneficiary/add-beneficiary.component';



@NgModule({
  declarations: [
    BeneficiaryListComponent,
    BeneficiariesComponent,
    AddBeneficiaryComponent
  ],
  imports: [
    CommonModule,
    BeneficiariesRoutingModule,
    SharedModule
  ]
})
export class BeneficiariesModule { }
