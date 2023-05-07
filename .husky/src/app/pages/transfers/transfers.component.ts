import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransfersComponent implements OnInit {

  transfersNavs = [
    { route: 'transfer-otherbanks', description: 'Transfer to Other Banks' },
    { route: 'transfer-self', description: 'Transfer to Self' },
    { route: 'transfer-beneficiairies', description: 'Transfer to Beneficiaries' },
    { route: 'transfer-ease', description: 'Transfer to @ease accounts' },
    { route: 'fund-prepaid-card', description: 'Fund Prepaid Card' },
    { route: 'transfer-stanbic', description: 'Transfer to stanbic accounts' },
  ];


  constructor() { }

  ngOnInit(): void {
  }

}
