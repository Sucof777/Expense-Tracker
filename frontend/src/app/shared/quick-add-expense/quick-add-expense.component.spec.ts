import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAddExpenseComponent } from './quick-add-expense.component';

describe('QuickAddExpenseComponent', () => {
  let component: QuickAddExpenseComponent;
  let fixture: ComponentFixture<QuickAddExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAddExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickAddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
