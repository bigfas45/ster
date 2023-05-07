import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundPrepaidCardComponent } from './fund-prepaid-card.component';

describe('FundPrepaidCardComponent', () => {
  let component: FundPrepaidCardComponent;
  let fixture: ComponentFixture<FundPrepaidCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundPrepaidCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundPrepaidCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
