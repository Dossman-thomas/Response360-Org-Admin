import { Op } from 'sequelize';

export const operatorMapping = {
  contains: Op.iLike,
  doesnotcontain: Op.notLike,
  eq: Op.eq,
  neq: Op.ne,
  startswith: Op.startsWith,
  endswith: Op.endsWith,
  greaterThan: Op.gt,
  lessThan: Op.lt,
  greaterThanOrEquals: Op.gte,
  lessThanOrEquals: Op.lte,
};
