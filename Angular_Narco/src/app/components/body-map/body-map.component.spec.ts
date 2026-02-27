import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyMapComponent } from './body-map.component';

describe('BodyMapComponent', () => {
  let component: BodyMapComponent;
  let fixture: ComponentFixture<BodyMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BodyMapComponent]
    });
    fixture = TestBed.createComponent(BodyMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

