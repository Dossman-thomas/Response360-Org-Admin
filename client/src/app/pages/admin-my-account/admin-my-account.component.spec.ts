import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMyAccountComponent } from './admin-my-account.component';

describe('AdminMyAccountComponent', () => {
  let component: AdminMyAccountComponent;
  let fixture: ComponentFixture<AdminMyAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminMyAccountComponent]
    });
    fixture = TestBed.createComponent(AdminMyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
