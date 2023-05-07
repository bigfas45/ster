import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanksListDialogComponent } from './bankslist-dialog.component';

describe('BanksListDialogComponent', () => {
  let component: BanksListDialogComponent;
  let fixture: ComponentFixture<BanksListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanksListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanksListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
