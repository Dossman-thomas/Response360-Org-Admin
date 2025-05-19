import { Sequelize } from 'sequelize';

export const decryptSensitiveData = (columnName, pubkey) => {
  const alias = columnName.includes('.')
    ? columnName.split('.').pop()
    : columnName;

  return [
    Sequelize.fn(
      'PGP_SYM_DECRYPT',
      Sequelize.cast(Sequelize.col(columnName), 'bytea'),
      pubkey
    ),
    alias,
  ];
};
