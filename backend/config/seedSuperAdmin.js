const Admin = require('../models/Admin');

const seedSuperAdmin = async () => {
  try {
    const superAdmin = await Admin.findOne({ username: 'superadmin' });
    if (!superAdmin) {
      console.log('🌱 Seeding Superadmin account...');
      await Admin.create({
        username: 'superadmin',
        password: 'Super@1234',
        name: 'Super Admin',
        email: 'superadmin@the247panel.com',
        phoneNumber: '9999999999',
        role: 'superadmin',
        agentCode: 'SUPER',
        permissions: {
          canCreateUsers: true,
          canUpdateUserBalance: true,
          canChangeUserPassword: true,
          canDeleteUsers: true,
          canAddWebsites: true,
          canEditWebsites: true,
          canDeleteWebsites: true,
          canManageCategories: true,
          canManageIdRequests: true,
          canManageTransactions: true,
          canEditIdCredentials: true,
          canManageBanners: true,
          canManageSupportLinks: true,
        },
      });
      console.log('✅ Superadmin created successfully (username: superadmin, password: Super@1234)');
    } else {
      // Ensure superadmin has superadmin role and all permissions
      let updated = false;
      if (superAdmin.role !== 'superadmin') {
        superAdmin.role = 'superadmin';
        updated = true;
      }
      if (!superAdmin.permissions || !superAdmin.permissions.canCreateUsers || superAdmin.permissions.canManageSupportLinks === undefined) {
        superAdmin.permissions = {
          canCreateUsers: true,
          canUpdateUserBalance: true,
          canChangeUserPassword: true,
          canDeleteUsers: true,
          canAddWebsites: true,
          canEditWebsites: true,
          canDeleteWebsites: true,
          canManageCategories: true,
          canManageIdRequests: true,
          canManageTransactions: true,
          canEditIdCredentials: true,
          canManageBanners: true,
          canManageSupportLinks: true,
        };
        updated = true;
      }
      if (updated) {
        await superAdmin.save();
        console.log('✅ Superadmin role and permissions verified');
      }
    }
  } catch (error) {
    console.error('Error seeding Superadmin:', error.message);
  }
};

module.exports = seedSuperAdmin;
