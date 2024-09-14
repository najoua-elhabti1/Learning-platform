import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllChapitersComponent } from './all-chapiters.component';

describe('AllChapitersComponent', () => {
  let component: AllChapitersComponent;
  let fixture: ComponentFixture<AllChapitersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllChapitersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllChapitersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
