import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAdminProfileComponent } from './org-admin-profile.component';

describe('OrgAdminProfileComponent', () => {
  let component: OrgAdminProfileComponent;
  let fixture: ComponentFixture<OrgAdminProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrgAdminProfileComponent]
    });
    fixture = TestBed.createComponent(OrgAdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
