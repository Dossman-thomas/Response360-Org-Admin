// collectionDetails.utils.ts
import { CollectionService } from '../../services/collection.service';

interface CollectionResponse {
  rows: any[];
  count: number;
}

export function loadCollectionDetails(
  collectionService: CollectionService,
  orgId: string,
  requestBody: any,
  onSuccess: (gridData: { data: any[]; total: number }) => void,
  onError?: (err: any) => void
): void {
  collectionService.getActiveCollections(orgId, requestBody).subscribe({
    next: (response: CollectionResponse) => {
      if (Array.isArray(response.rows)) {
        const gridData = {
          data: response.rows,
          total:
            typeof response.count === 'number'
              ? response.count
              : response.rows.length,
        };
        onSuccess(gridData);
      } else {
        console.error(
          'Unexpected response format from getActiveCollections:',
          response
        );

        onError?.(response);
      }
    },
    error: (err) => {
      console.error('Failed to fetch collection details: ', err);
      if (err.message === 'Failed to fetch collections') {
        console.log('Error: Failed to fetch collections: ', err.message);
      }
      onError?.(err);
    },
  });
}
