// where.util.js
import { Op, Sequelize } from 'sequelize';
import { operatorMapping } from './index.js'; // Assuming you have operator mappings elsewhere

export const buildWhereClause = ({ filters, searchQuery, statusQuery, pubkey }) => {
  // normalize searchQuery
  const normalizedQuery = searchQuery?.toLowerCase();
  
  // map 'true' to 'Enabled' and 'false' to 'Disabled'
  const statusQueryMapped =
    normalizedQuery === 'true'
      ? 'Enabled'
      : normalizedQuery === 'false'
      ? 'Disabled'
      : searchQuery;

  // Build the filter part
  const filterConditions = filters?.length
    ? filters
        .filter((filter) => filter.field.startsWith('org_'))
        .map((filter) => {
          if (filter.field === 'org_status') {
            const operator = filter.operator === 'eq' ? Op.eq : Op.ne;
            return {
              [filter.field]: { [operator]: filter.value === 'true' },
            };
          } else {
            const operator = operatorMapping[filter.operator] || Op.eq;
            const value =
              filter.operator === 'contains' || filter.operator === 'doesnotcontain'
                ? `%${filter.value}%`
                : filter.value;

            return Sequelize.where(
              Sequelize.fn(
                'PGP_SYM_DECRYPT',
                Sequelize.cast(Sequelize.col(filter.field), 'bytea'),
                pubkey
              ),
              { [operator]: value }
            );
          }
        })
        .filter(Boolean) // Remove any null, undefined, or false values from array.
    : [];

  // Build the search query part
  const searchConditions = searchQuery
    ? {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn(
              'PGP_SYM_DECRYPT',
              Sequelize.cast(Sequelize.col('org_name'), 'bytea'),
              pubkey
            ),
            { [Op.like]: `%${searchQuery}%` }
          ),
          Sequelize.where(
            Sequelize.fn(
              'PGP_SYM_DECRYPT',
              Sequelize.cast(Sequelize.col('org_email'), 'bytea'),
              pubkey
            ),
            { [Op.like]: `%${searchQuery}%` }
          ),
          Sequelize.where(
            Sequelize.fn(
              'PGP_SYM_DECRYPT',
              Sequelize.cast(Sequelize.col('org_phone_number'), 'bytea'),
              pubkey
            ),
            { [Op.like]: `%${searchQuery}%` }
          ),
          ...(statusQueryMapped === 'Enabled' || statusQueryMapped === 'Disabled'
            ? [
                {
                  org_status: {
                    [Op.eq]: statusQueryMapped === 'Enabled',
                  },
                },
              ]
            : []),
        ],
      }
    : {};

  // Return the complete where clause
  return {
    [Op.and]: [...filterConditions, searchConditions],
  };
};
