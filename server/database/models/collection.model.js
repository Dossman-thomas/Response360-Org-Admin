import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/index.js';

const CollectionModel = sequelize.define(
  'collections',
  {
    collection_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    collection_name: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    collection_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // active by default
    },
    org_id: {
      type: DataTypes.UUID,
      references: { model: 'organizations', key: 'org_id' },
    },
    collection_created_by: {
      type: DataTypes.UUID,
    },
    collection_updated_by: {
      type: DataTypes.UUID,
    },
    collection_deleted_by: {
      type: DataTypes.UUID,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'collection_created_at',
    updatedAt: 'collection_updated_at',
    deletedAt: 'collection_deleted_at',
    paranoid: true, // Soft deletes
  }
);

export default CollectionModel;
