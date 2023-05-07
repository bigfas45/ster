import { APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import {  RouterModule, Routes } from "@angular/router";
import { FundPrepaidCardComponent } from "./fund-prepaid-card/fund-prepaid-card.component";
import { TransferBeneficiariesComponent } from "./transfer-beneficiaries/transfer-beneficiaries.component";
import { TransferEaseComponent } from "./transfer-ease/transfer-ease.component";
import { TransferOtherbanksComponent } from "./transfer-otherbanks/transfer-otherbanks.component";
import { TransferSelfComponent } from "./transfer-self/transfer-self.component";
import { TransfersComponent } from "./transfers.component";
import { TransferStanbicComponent } from "./transfer-stanbic/transfer-stanbic.component";

const routes: Routes = [
{path: '', component: TransfersComponent, children: [
  {path: '', redirectTo: 'transfer-otherbanks'},
  {path: 'transfer-otherbanks', component: TransferOtherbanksComponent},
  {path: 'transfer-self', component: TransferSelfComponent},
  {path: 'transfer-beneficiairies', component: TransferBeneficiariesComponent},
  {path: 'transfer-ease', component: TransferEaseComponent},
  {path: 'fund-prepaid-card', component: FundPrepaidCardComponent},
  {path: 'transfer-stanbic', component: TransferStanbicComponent },
]}
];


@NgModule ({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})

export class TransfersRoutingModule {}
