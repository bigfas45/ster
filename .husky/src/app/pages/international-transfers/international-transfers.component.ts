import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-international-transfers',
  templateUrl: './international-transfers.component.html',
  styleUrls: ['./international-transfers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InternationalTransfersComponent implements OnInit {
  internationalTransfersNavs = [
    { route: 'western-union', description: 'Western Union Redemption' },
    // { route: 'mastercard-payment', description: 'MasterCard Payment' },
  ];
  constructor() {}

  ngOnInit(): void {}
}
