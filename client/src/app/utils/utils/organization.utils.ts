// organization.utils.ts
import { OrganizationService } from '../../services/organization.service';
import { CryptoService } from '../../services/crypto.service';
import { Router } from '@angular/router';

export function loadOrgDetails(
  organizationService: OrganizationService,
  requestBody: any,
  onSuccess: (gridData: { data: any[]; total: number }) => void,
  onError?: (err: any) => void
): void {
  organizationService.getAllOrganizations(requestBody).subscribe({
    next: (response: any) => {
      if (Array.isArray(response.rows)) {
        const gridData = {
          data: response.rows,
          total: response.count || response.rows.length,
        };
        onSuccess(gridData);
      } else {
        console.error('Failed to fetch organization details:', response);
        onError?.(response);
      }
    },
    error: (err) => {
      console.error('Failed to fetch organization details: ', err);
      if (err.message === 'Failed to fetch organizations') {
        console.log('Error: Failed to fetch organizations: ', err.message);
      }
      onError?.(err);
    },
  });
}

export function navToEditOrg(
  orgId: string,
  cryptoService: CryptoService,
  router: Router
): void {
  const encryptedOrgId = cryptoService.Encrypt(orgId);

  router.navigate(['/organization-details'], {
    queryParams: { mode: 'update', orgId: encryptedOrgId },
  });
}

export function handleDeleteOrg(
  orgId: string,
  setShowModal: (val: boolean) => void,
  setDeleteId: (id: string) => void
): void {
  setShowModal(true);
  setDeleteId(orgId);
}

export function handleCancelDelete(resetModal: () => void): void {
  resetModal();
}

export function handleConfirmDelete(
  deleteOrgId: string,
  organizationService: OrganizationService,
  currentData: any[],
  updateGridData: (data: any[]) => void,
  resetModal: () => void
): void {
  if (!deleteOrgId) return;

  organizationService.deleteOrganization(deleteOrgId).subscribe({
    next: (response) => {
      console.log('Organization deleted successfully:', response);

      const updatedData = currentData.filter(
        (org: any) => org.org_id !== deleteOrgId
      );
      updateGridData(updatedData);
      resetModal();
    },
    error: (err) => {
      console.error('Failed to delete organization:', err);
    },
  });
}

