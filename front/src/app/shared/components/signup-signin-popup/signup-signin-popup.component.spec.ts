import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSigninPopupComponent } from './signup-signin-popup.component';

describe('SignupSigninPopupComponent', () => {
  let component: SignupSigninPopupComponent;
  let fixture: ComponentFixture<SignupSigninPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupSigninPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupSigninPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
