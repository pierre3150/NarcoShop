import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBodyPartsComponent } from './manage-body-parts.component';

describe('ManageBodyPartsComponent', () => {
  let component: ManageBodyPartsComponent;
  let fixture: ComponentFixture<ManageBodyPartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageBodyPartsComponent]
    });
    fixture = TestBed.createComponent(ManageBodyPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
