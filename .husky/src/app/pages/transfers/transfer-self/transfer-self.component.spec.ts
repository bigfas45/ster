import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferSelfComponent } from './transfer-self.component';

describe('TransferSelfComponent', () => {
  let component: TransferSelfComponent;
  let fixture: ComponentFixture<TransferSelfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferSelfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferSelfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
