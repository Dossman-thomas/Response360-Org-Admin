import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import { StatsService } from '../../services/stats.service';
import { OrganizationService } from '../../services/organization.service';
import { State } from '@progress/kendo-data-query';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';

// Utils
import {
  loadOrgDetails,
  navToEditOrg,
  handleDeleteOrg,
  handleCancelDelete,
  handleConfirmDelete,
} from '../../utils/utils/organization.utils';
import { buildOrgReqBody } from '../../utils/utils/table.utils';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private statsService: StatsService,
    private organizationService: OrganizationService
  ) {}

  deleteOrganizationId: string | null = null;
  showDeleteModal: boolean = false;
  totalUsers: number = 0;
  totalOrganizations: number = 0;

  // Kendo Grid settings
  gridData: any = { data: [], total: 0 };

  body: any = {
    page: 1,
    sorts: null,
    filters: null,
    limit: 5,
  };

  // Kendo Grid state
  public state: State = {
    take: 5,
  };

  ngOnInit(): void {
    this.getDashboardStats();
    this.loadOrgDetails();
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.body = buildOrgReqBody(state, this.body);
    this.loadOrgDetails();
  }

  // Fetch organization details
  private loadOrgDetails(): void {
    loadOrgDetails(
      this.organizationService,
      this.body,
      (gridData: any) => {
        this.gridData = gridData;
      },
      (err: { message: any }) => {
        console.error('Failed to fetch organization details: ', err);
        console.log('Error: ', err.message);
      }
    );
  }

  // Fetch dashboard stats
  getDashboardStats(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (response: any) => {
        this.totalUsers = response.userCount || 0;
        this.totalOrganizations = response.orgCount || 0;
      },
      error: (err) => {
        console.error('Failed to fetch dashboard stats:', err);
      },
    });
  }

  // Edit organization (get org_id from row data)
  onEditOrganization(orgId: string): void {
    navToEditOrg(orgId, this.cryptoService, this.router);
  }

  // Delete organization (get org_id from row data)
  onDeleteOrganization(orgId: string): void {
    handleDeleteOrg(
      orgId,
      (val) => (this.showDeleteModal = val),
      (id) => (this.deleteOrganizationId = id)
    );
  }

  private resetDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteOrganizationId = null;
  }

  onConfirmDelete(): void {
    if (typeof this.deleteOrganizationId === 'string') {
      handleConfirmDelete(
        this.deleteOrganizationId,
        this.organizationService,
        this.gridData.data,
        (newData) => (this.gridData.data = newData),
        () => this.resetDeleteModal()
      );
    }
  }

  // Cancel delete
  onCancelDelete(): void {
    handleCancelDelete(() => this.resetDeleteModal());
  }
}
