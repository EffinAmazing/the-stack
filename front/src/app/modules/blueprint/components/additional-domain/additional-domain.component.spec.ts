import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalDomainComponent } from './additional-domain.component';

describe('AdditionalDomainComponent', () => {
  let component: AdditionalDomainComponent;
  let fixture: ComponentFixture<AdditionalDomainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalDomainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
