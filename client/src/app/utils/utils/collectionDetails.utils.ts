// collectionDetails.utils.ts
import { CollectionService } from '../../services/collection.service';

export function loadCollectionDetails(
  collectionService: CollectionService,
  orgId: string, 
  requestBody: any,
  onSuccess: (gridData: { data: any[]; total: number }) => void,
  onError?: (err: any) => void
): void {
  collectionService.getActiveCollections(orgId, requestBody).subscribe({
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



