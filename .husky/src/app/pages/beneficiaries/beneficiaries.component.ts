import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BeneficiariesComponent implements OnInit {

  beneficiariesNav = [
    { route: 'beneficiary-list', description: 'Beneficiaries' },
    { route: 'add-beneficiary', description: 'Add Beneficiary' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
