import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/index.js';

const RoleModel = sequelize.define(
  'roles',
  {
    role_id: {
        type: DataTypes.INTEGER, // ID? 
        primaryKey: true,
        autoIncrement: true,
    },
    role_title: {
        type: DataTypes.TEXT, // encrypted?
        allowNull: false,
    },
    role_description: {
        type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'role_created_at',
    updatedAt: 'role_updated_at',
    deletedAt: 'role_deleted_at',
    // paranoid: true // is this necessary?
  }
);

export default RoleModel;
