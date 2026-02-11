import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvacuationsComponent } from './evacuations';

describe('EvacuationsComponent', () => {
  let component: EvacuationsComponent;
  let fixture: ComponentFixture<EvacuationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvacuationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvacuationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
