import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesListDialogComponent } from './countries-list-dialog.component';

describe('CountriesListDialogComponent', () => {
  let component: CountriesListDialogComponent;
  let fixture: ComponentFixture<CountriesListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountriesListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountriesListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
