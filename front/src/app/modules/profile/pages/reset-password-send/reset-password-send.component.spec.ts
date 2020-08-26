import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordSendComponent } from './reset-password-send.component';

describe('ResetPasswordSendComponent', () => {
  let component: ResetPasswordSendComponent;
  let fixture: ComponentFixture<ResetPasswordSendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordSendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
