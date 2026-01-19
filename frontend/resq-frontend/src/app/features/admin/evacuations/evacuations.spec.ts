import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Evacuations } from './evacuations';

describe('Evacuations', () => {
  let component: Evacuations;
  let fixture: ComponentFixture<Evacuations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evacuations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Evacuations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
