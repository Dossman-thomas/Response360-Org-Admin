// order.util.js
import { Sequelize } from 'sequelize';

const isValidDirection = (dir) =>
  typeof dir === 'string' && ['asc', 'desc'].includes(dir.toLowerCase());

export const buildOrderClause = (sorts) => {
  const validSorts =
    sorts?.length > 0
      ? sorts.filter((sort) => sort.field && sort.field.startsWith('user_'))
      : [];

  return validSorts.length > 0 && validSorts.every((s) => isValidDirection(s.dir))
    ? validSorts.map((sort) => [
        Sequelize.literal(`${sort.field}`),
        sort.dir.toUpperCase(),
      ])
    : [['user_created_at', 'DESC']];
};
