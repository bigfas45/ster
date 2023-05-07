import { APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import {  RouterModule, Routes } from "@angular/router";
import { AddBeneficiaryComponent } from "./add-beneficiary/add-beneficiary.component";
import { BeneficiariesComponent } from "./beneficiaries.component";
import { BeneficiaryListComponent } from "./beneficiary-list/beneficiary-list.component";

const routes: Routes = [
{path: '', component: BeneficiariesComponent, children: [
  {path: '', redirectTo: 'beneficiary-list'},
  {path: 'beneficiary-list', component: BeneficiaryListComponent},
  {path: 'add-beneficiary', component: AddBeneficiaryComponent},
  {path: 'add-beneficiary/:id', component: AddBeneficiaryComponent},
]}
];


@NgModule ({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})

export class BeneficiariesRoutingModule {}
