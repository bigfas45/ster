import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferOtherbanksComponent } from './transfer-otherbanks.component';

describe('TransferOtherbanksComponent', () => {
  let component: TransferOtherbanksComponent;
  let fixture: ComponentFixture<TransferOtherbanksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferOtherbanksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferOtherbanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
