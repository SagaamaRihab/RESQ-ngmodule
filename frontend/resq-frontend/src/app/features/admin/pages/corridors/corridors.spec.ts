import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorridorsComponent } from './corridors';

describe('CorridorsComponent', () => {
  let component: CorridorsComponent;
  let fixture: ComponentFixture<CorridorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorridorsComponent], // ✅ standalone
    }).compileComponents();

    fixture = TestBed.createComponent(CorridorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
