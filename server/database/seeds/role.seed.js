import RoleModel from '../models/index.js';

export const seedRoles = async () => {
  await RoleModel.bulkCreate(
    [
      { role_title: 'Super Admin', role_description: 'Full system access' },
      { role_title: 'Admin', role_description: 'Manages an organization' },
      { role_title: 'Data Manager', role_description: 'Manages data uploads' },
      { role_title: 'Flinger', role_description: 'Field worker who collects data' },
    ],
    { ignoreDuplicates: true }
  );
};
