import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternationalTransfersComponent } from './international-transfers.component';
import { MastercardPaymentComponent } from './mastercard-payment/mastercard-payment.component';
import { WesternUnionComponent } from './western-union/western-union.component';

const routes: Routes = [
  {
    path: '',
    component: InternationalTransfersComponent,
    children: [
      { path: '', redirectTo: 'western-union' },
      { path: 'western-union', component: WesternUnionComponent },
      // {path: 'mastercard-payment', component: MastercardPaymentComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
})
export class InternationalTransfersRoutingModule {}
