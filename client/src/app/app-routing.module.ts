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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/super-admin-login', pathMatch: 'full' },
      {
        path: 'super-admin-dashboard',
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
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'super-admin-login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/super-admin-login' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
