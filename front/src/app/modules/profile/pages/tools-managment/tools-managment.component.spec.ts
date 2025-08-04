import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsManagmentComponent } from './tools-managment.component';

describe('UsersManagmentComponent', () => {
  let component: ToolsManagmentComponent;
  let fixture: ComponentFixture<ToolsManagmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsManagmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});