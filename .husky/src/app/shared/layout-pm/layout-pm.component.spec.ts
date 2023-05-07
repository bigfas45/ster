import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPmComponent } from './layout-pm.component';

describe('LayoutPmComponent', () => {
  let component: LayoutPmComponent;
  let fixture: ComponentFixture<LayoutPmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutPmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
