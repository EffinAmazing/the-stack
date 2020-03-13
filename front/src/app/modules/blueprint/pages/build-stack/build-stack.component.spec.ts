import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildStackComponent } from './build-stack.component';

describe('BuildStackComponent', () => {
  let component: BuildStackComponent;
  let fixture: ComponentFixture<BuildStackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildStackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
