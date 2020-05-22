import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteToStackComponent } from './invite-to-stack.component';

describe('InviteToStackComponent', () => {
  let component: InviteToStackComponent;
  let fixture: ComponentFixture<InviteToStackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteToStackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteToStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
