import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Corridors } from './corridors';

describe('Corridors', () => {
  let component: Corridors;
  let fixture: ComponentFixture<Corridors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Corridors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Corridors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
