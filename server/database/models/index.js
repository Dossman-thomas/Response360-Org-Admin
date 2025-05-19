import UserModel from "./user.model.js";
import OrganizationModel from "./organization.model.js";

// Organization has many Users
OrganizationModel.hasMany(UserModel, { 
  foreignKey: "org_id", 
  as: "users" 
});

// User belongs to an Organization
UserModel.belongsTo(OrganizationModel, { 
  foreignKey: "org_id", 
  as: "organizations" 
});

export { UserModel, OrganizationModel };
