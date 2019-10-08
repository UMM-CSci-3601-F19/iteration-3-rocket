import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySummariesComponent } from './company-summaries.component';

describe('CompanySummariesComponent', () => {
  let component: CompanySummariesComponent;
  let fixture: ComponentFixture<CompanySummariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanySummariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanySummariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
