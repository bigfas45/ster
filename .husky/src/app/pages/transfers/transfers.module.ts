import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransfersComponent } from './transfers.component';
import { TransferOtherbanksComponent } from './transfer-otherbanks/transfer-otherbanks.component';
import { TransferSelfComponent } from './transfer-self/transfer-self.component';
import { TransferBeneficiariesComponent } from './transfer-beneficiaries/transfer-beneficiaries.component';
import { TransferEaseComponent } from './transfer-ease/transfer-ease.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransfersRoutingModule } from './transfers-routing.module';
import { FundPrepaidCardComponent } from './fund-prepaid-card/fund-prepaid-card.component';
import { TransferStanbicComponent }  from './transfer-stanbic/transfer-stanbic.component';

@NgModule({
  declarations: [
    TransfersComponent,
    TransferOtherbanksComponent,
    TransferSelfComponent,
    TransferBeneficiariesComponent,
    TransferEaseComponent,
    FundPrepaidCardComponent,
    TransferStanbicComponent,
  ],
  imports: [CommonModule, SharedModule, TransfersRoutingModule],
})
export class TransfersModule {}
