import { DataTypes } from "sequelize";
import { sequelize } from "../../config/index.js";
import { hashPassword } from "../../utils/index.js";

import bcrypt from "bcrypt";

const UserModel = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: { 
      type: DataTypes.TEXT, // encrypted
      allowNull: false,
    },
    last_name: {
      type: DataTypes.TEXT, // encrypted
      allowNull: false,
    },
    user_email: {
      type: DataTypes.TEXT, // encrypted
      allowNull: false,
      unique: true,
    },
    user_phone_number: {
      type: DataTypes.TEXT, // encrypted
    },
    user_role: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.UUID,
      references: { model: "organizations", key: "org_id" },
    },
    user_password: {
      type: DataTypes.TEXT, // Hashed password (not encrypted, just hashed)
      allowNull: false,
    },
    user_created_by: {
      type: DataTypes.UUID,
    },
    user_updated_by: {
      type: DataTypes.UUID,
    },
    user_deleted_by: {
      type: DataTypes.UUID,
    },
    is_super_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Active by default
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "user_created_at",
    updatedAt: "user_updated_at",
    deletedAt: "user_deleted_at",
    paranoid: true, // Enables soft delete (Sequelize will ignore deleted records in queries)
  }
);

// Hash password before saving
UserModel.beforeCreate(async (user) => {
  user.user_password = await hashPassword(user.user_password);
});

// Hash password before updating if changed
UserModel.beforeUpdate(async (user) => {
  if (user.changed("user_password")) {
    user.user_password = await hashPassword(user.user_password);
  }
});

// Set user_status to false before soft-deleting a user
UserModel.beforeDestroy(async (user) => {
  user.user_status = false;
  await user.save(); // Update user_status before soft deletion
});

// Compare password
UserModel.prototype.verifyPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.user_password);
};


export default UserModel;