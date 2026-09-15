const Admin = require('../models/Admin');

/**
 * Middleware to extract the requesting admin and attach to req.admin
 */
const getAdminContext = async (req) => {
  const adminId = req.headers['x-admin-id'] || req.query.adminId || req.body.adminId;
  if (!adminId) return null;

  try {
    const admin = await Admin.findById(adminId);
    return admin;
  } catch (err) {
    return null;
  }
};

/**
 * Check if requesting admin has a specific permission
 */
const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    const admin = await getAdminContext(req);
    if (!admin) {
      // If no admin context passed, let it pass or check if required
      return next();
    }

    // Superadmin has all permissions
    if (admin.role === 'superadmin') {
      req.admin = admin;
      return next();
    }

    // Sub-admin permission check
    if (admin.permissions && admin.permissions[permissionName] === false) {
      return res.status(403).json({
        message: `Permission denied. You do not have permission: ${permissionName}`,
      });
    }

    req.admin = admin;
    next();
  };
};

module.exports = {
  getAdminContext,
  checkPermission,
};
