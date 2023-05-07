import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-layout-pm',
  templateUrl: './layout-pm.component.html',
  styleUrls: ['./layout-pm.component.scss']
})
export class LayoutPmComponent implements OnInit {

  @Input() navLinks: { route: string; description: string; }[];

  constructor() { }

  ngOnInit(): void {
  }

}
