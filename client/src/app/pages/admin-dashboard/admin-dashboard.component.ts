import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import { StatsService } from '../../services/stats.service';
import { CollectionService } from 'src/app/services/collection.service';
import { State } from '@progress/kendo-data-query';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';

// Utils
import { loadCollectionDetails } from '../../utils/utils/collectionDetails.utils';
import { buildCollectionReqBody } from '../../utils/utils/table.utils';

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
    private collectionService: CollectionService
  ) {}

  deleteOrganizationId: string | null = null;
  showDeleteModal: boolean = false;
  orgId: string | null = null;
  dataManagerCount: number = 0;
  flingerCount: number = 0;
  collectionCount: number = 0; 

  // Kendo Grid settings
  gridData: any = { data: [], total: 0 };

  body: any = {
    page: 1,
    limit: 5,
  };

  // Kendo Grid state
  public state: State = {
    take: 5,
  };

  ngOnInit(): void {
    const encryptedOrgId = localStorage.getItem('orgId');
    this.orgId = encryptedOrgId
      ? this.cryptoService.Decrypt(encryptedOrgId)
      : null;
    
    if (!this.orgId) {
      console.error('Missing orgId. cannot fetch collection details.');
      return; 
    }

    this.getDashboardStats();
    this.loadCollectionDetails(this.orgId);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.body = buildCollectionReqBody(state, this.body);

    if (!this.orgId) {
      console.error('Missing orgId. Cannot fetch collection data.');
      return;
    }

    this.loadCollectionDetails(this.orgId);
  }

  // Fetch organization details
  private loadCollectionDetails(orgId: string): void {
    loadCollectionDetails(
      this.collectionService,
      orgId,
      this.body,
      (gridData: any) => {
        this.gridData = gridData;
      },
      (err) => {
        console.error('Failed to fetch organization details: ', err);
      }
    );
  }

  // Fetch dashboard stats
  getDashboardStats(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (response: any) => {
        this.dataManagerCount = response.dataManagerCount || 0;
        this.flingerCount = response.flingerCount || 0;
        this.collectionCount = response.collectionCount || 0;
      },
      error: (err) => {
        console.error('Failed to fetch dashboard stats:', err);
      },
    });
  }
}
