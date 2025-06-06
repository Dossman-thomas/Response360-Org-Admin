import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrganizationsComponent } from './manage-organizations.component';

describe('ManageOrganizationsComponent', () => {
  let component: ManageOrganizationsComponent;
  let fixture: ComponentFixture<ManageOrganizationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageOrganizationsComponent]
    });
    fixture = TestBed.createComponent(ManageOrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
