import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChapiterComponent } from './add-chapiter.component';

describe('AddChapiterComponent', () => {
  let component: AddChapiterComponent;
  let fixture: ComponentFixture<AddChapiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChapiterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChapiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
