import { seedRoles } from './role.seed.js';

(async () => {
  try {
    await seedRoles();
    console.log('Roles seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
})();
