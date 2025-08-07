import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalAppComponent } from './additional-app.component';

describe('AdditionalAppComponent', () => {
  let component: AdditionalAppComponent;
  let fixture: ComponentFixture<AdditionalAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
