import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubdomainDetectComponent } from './subdomain-detect.component';

describe('SubdomainDetectComponent', () => {
  let component: SubdomainDetectComponent;
  let fixture: ComponentFixture<SubdomainDetectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubdomainDetectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubdomainDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
