import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

import { LayoutComponent } from './pages/layout/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { ManageOrganizationsComponent } from './pages/manage-organizations/manage-organizations.component';
import { OrganizationDetailsComponent } from './pages/organization-details/organization-details.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminMyAccountComponent } from './pages/admin-my-account/admin-my-account.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { OrgAdminProfileComponent } from './pages/org-admin-profile/org-admin-profile.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/org-admin-login', pathMatch: 'full' },
      {
        path: 'org-admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'manage-organizations',
        component: ManageOrganizationsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'organization-details',
        component: OrganizationDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'admin-my-account',
        component: AdminMyAccountComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'org-admin-profile',
    component: OrgAdminProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'org-admin-login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/org-admin-login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
