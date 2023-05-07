import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {APP_BASE_HREF} from "@angular/common";
import {EmptyRouteComponent} from "./empty-route/empty-route.component";

const routes: Routes = [
  {
    path: 'transfer',
    redirectTo: 'transfer/transfers',
    pathMatch: 'full'
  },
  {
    path: 'transfer/transfers',
    loadChildren: () =>
    import('./pages/transfers/transfers.module').then(
      (m) => m.TransfersModule
    ),
  },
  {
    path: 'transfer/international-transfers',
    loadChildren: () =>
    import('./pages/international-transfers/international-transfers.module').then(
      (m) => m.InternationalTransfersModule
    ),
  },
  {
    path: 'transfer/beneficiaries',
    loadChildren: () =>
    import('./pages/beneficiaries/beneficiaries.module').then(
      (m) => m.BeneficiariesModule
    ),
  },
  { path: '**', component: EmptyRouteComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
})
export class AppRoutingModule { }
