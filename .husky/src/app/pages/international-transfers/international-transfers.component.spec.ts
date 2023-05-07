import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalTransfersComponent } from './international-transfers.component';

describe('InternationalTransfersComponent', () => {
  let component: InternationalTransfersComponent;
  let fixture: ComponentFixture<InternationalTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternationalTransfersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternationalTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
