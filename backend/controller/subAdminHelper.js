const Admin = require('../models/Admin');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Resolves the requesting admin based on headers or query or body
 */
const getAdminFromReq = async (req) => {
  const adminId = req.headers['x-admin-id'] || req.query.adminId || req.body.adminId;
  const adminRole = req.headers['x-admin-role'] || req.query.role || req.body.role;

  if (!adminId) return null;

  try {
    let admin = null;
    if (mongoose.Types.ObjectId.isValid(adminId)) {
      admin = await Admin.findById(adminId);
    }
    if (!admin) {
      admin = await Admin.findOne({ username: adminId });
    }
    return admin;
  } catch (err) {
    console.error('Error resolving admin:', err);
    return null;
  }
};

/**
 * Returns all user IDs and usernames assigned to a specific admin
 */
const getAdminUserIdentifiers = async (adminId) => {
  if (!adminId) {
    const empty = [];
    empty.ids = [];
    empty.usernames = [];
    return empty;
  }

  try {
    const adminObjId = mongoose.Types.ObjectId.isValid(adminId)
      ? new mongoose.Types.ObjectId(adminId)
      : null;

    // Check by assignedAdmin ObjectId or String or assignedAdminUsername
    const orConditions = [
      { assignedAdmin: adminId },
    ];
    if (adminObjId) {
      orConditions.push({ assignedAdmin: adminObjId });
    }

    // Also look up admin to check username / agentCode
    const admin = mongoose.Types.ObjectId.isValid(adminId)
      ? await Admin.findById(adminId)
      : await Admin.findOne({ username: adminId });

    if (admin) {
      if (admin.username) {
        orConditions.push({ assignedAdminUsername: admin.username });
      }
      if (admin.agentCode) {
        orConditions.push({ agentCode: admin.agentCode });
      }
    }

    const ids = users.map(u => u._id.toString());
    const usernames = users.map(u => u.username).filter(Boolean);
    const allIdentifiers = Array.from(new Set([...ids, ...usernames]));
    allIdentifiers.ids = ids;
    allIdentifiers.usernames = usernames;

    return allIdentifiers;
  } catch (err) {
    console.error('Error in getAdminUserIdentifiers:', err);
    const empty = [];
    empty.ids = [];
    empty.usernames = [];
    return empty;
  }
};

module.exports = {
  getAdminFromReq,
  getAdminUserIdentifiers,
};
