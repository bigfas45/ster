import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WesternUnionComponent } from './western-union/western-union.component';
import { MastercardPaymentComponent } from './mastercard-payment/mastercard-payment.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InternationalTransfersRoutingModule } from './international-transfers-routing.module';
import { InternationalTransfersComponent } from './international-transfers.component';



@NgModule({
  declarations: [
    WesternUnionComponent,
    MastercardPaymentComponent,
    InternationalTransfersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InternationalTransfersRoutingModule
  ]
})
export class InternationalTransfersModule { }
