import UserModel from './user.model.js';
import OrganizationModel from './organization.model.js';
import CollectionModel from './collection.model.js';
import RoleModel from './role.model.js';

// ─── Organization ↔ Users ────────────────────────
OrganizationModel.hasMany(UserModel, {
  foreignKey: 'org_id',
  as: 'users',
});

UserModel.belongsTo(OrganizationModel, {
  foreignKey: 'org_id',
  as: 'organizations',
});

// ─── Organization ↔ Collections ──────────────────
OrganizationModel.hasMany(CollectionModel, {
  foreignKey: 'org_id',
  as: 'collections',
});

CollectionModel.belongsTo(OrganizationModel, {
  foreignKey: 'org_id',
  as: 'organizations',
});

// ─── User ↔ Role ─────────────────────────────────
RoleModel.hasMany(UserModel, {
  foreignKey: 'role_id',
  as: 'users',
});

UserModel.belongsTo(RoleModel, {
  foreignKey: 'role_id',
  as: 'roles',
});

export { UserModel, OrganizationModel, CollectionModel, RoleModel };
