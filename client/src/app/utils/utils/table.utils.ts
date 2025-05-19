import { DataStateChangeEvent } from '@progress/kendo-angular-grid';

export function buildOrgReqBody (
  state: DataStateChangeEvent,
  currentBody: any
): any {
  const updatedBody = { ...currentBody };

  updatedBody.page = Math.floor(state.skip / state.take) + 1;
  updatedBody.limit = state.take;

  // Sorts
  if (state.sort) {
    updatedBody.sorts = state.sort.map((sortElement) => ({
      field: sortElement.field,
      dir: sortElement.dir,
    }));
  } else {
    updatedBody.sorts = null;
  }

  // Filters
  if (state.filter?.filters?.length) {
    updatedBody.filters = state.filter.filters
      .flatMap((item: any) => item.filters || [])
      .map((filter: any) => ({
        field: filter.field,
        operator: filter.operator || 'contains',
        value: filter.value,
      }));
  } else {
    updatedBody.filters = null;
  }

  return updatedBody;
}
