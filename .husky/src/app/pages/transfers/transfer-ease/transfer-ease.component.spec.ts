import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferEaseComponent } from './transfer-ease.component';

describe('TransferEaseComponent', () => {
  let component: TransferEaseComponent;
  let fixture: ComponentFixture<TransferEaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferEaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferEaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
