import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferStanbicComponent } from './transfer-stanbic.component';

describe('TransferStanbicComponent', () => {
  let component: TransferStanbicComponent;
  let fixture: ComponentFixture<TransferStanbicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferStanbicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferStanbicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
