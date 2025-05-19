import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { OrganizationService } from '../../services/organization.service';
import { CryptoService } from '../../services/crypto.service';

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
  selector: 'app-manage-organizations',
  templateUrl: './manage-organizations.component.html',
  styleUrls: ['./manage-organizations.component.css'],
})
export class ManageOrganizationsComponent implements OnInit {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private cryptoService: CryptoService
  ) {}

  showDeleteModal = false;
  deleteOrganizationId: string | null = null;
  searchQuery: string = '';

  // Kendo Grid Settings
  gridData: any = { data: [], total: 0 };

  body: any = {
    page: 1,
    limit: 10,
    sorts: null,
    filters: null,
    searchQuery: '',
  };

  // Kendo Grid State
  public state: State = {
    skip: 0,
    take: 10,
    sort: [],
    filter: {
      logic: 'and',
      filters: [],
    },
  };

  ngOnInit() {
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

  onSearch(): void {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      // If input is cleared, remove search filter
      this.body.searchQuery = '';
    } else if ('active'.startsWith(normalizedQuery)) {
      this.body.searchQuery = 'true';
    } else if ('deactivated'.startsWith(normalizedQuery)) {
      this.body.searchQuery = 'false';
    } else {
      this.body.searchQuery = this.searchQuery;
    }

    this.body.page = 1;
    this.loadOrgDetails();
  }

  // For "New" button
  onNewOrganization(): void {
    this.router.navigate(['/organization-details'], {
      queryParams: { mode: 'create' },
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
