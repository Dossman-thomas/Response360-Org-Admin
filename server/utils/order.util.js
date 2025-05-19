// order.util.js
import { Sequelize } from 'sequelize';

export const buildOrderClause = (sorts) => {
  const validSorts =
    sorts?.length > 0
      ? sorts.filter((sort) => sort.field && sort.field.startsWith('org_'))
      : [];

  return validSorts.length > 0
    ? validSorts.every((sort) => sort.dir)
      ? validSorts.map((sort) => [
          Sequelize.literal(`${sort.field}`),
          sort.dir.toUpperCase(),
        ])
      : [['org_created_at', 'DESC']] // fallback if any sort is missing a dir
    : [['org_created_at', 'DESC']]; // default order
};
