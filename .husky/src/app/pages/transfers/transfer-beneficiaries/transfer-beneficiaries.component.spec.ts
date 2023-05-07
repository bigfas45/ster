import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBeneficiariesComponent } from './transfer-beneficiaries.component';

describe('TransferBeneficiariesComponent', () => {
  let component: TransferBeneficiariesComponent;
  let fixture: ComponentFixture<TransferBeneficiariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferBeneficiariesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferBeneficiariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
