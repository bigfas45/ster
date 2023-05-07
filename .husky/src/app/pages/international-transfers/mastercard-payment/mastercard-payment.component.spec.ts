import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MastercardPaymentComponent } from './mastercard-payment.component';

describe('MastercardPaymentComponent', () => {
  let component: MastercardPaymentComponent;
  let fixture: ComponentFixture<MastercardPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MastercardPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MastercardPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
