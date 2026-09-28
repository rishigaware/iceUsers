const SupportLink = require('../models/SupportLink');
const Admin = require('../models/Admin');
const User = require('../models/User');
const mongoose = require('mongoose');

const DEFAULT_LINKS = {
  whatsappSupport: 'https://wa.me/6285857878389',
  whatsappChannel: 'https://whatsapp.com/channel/0029VbC6sBZId7nLnyyDaE30',
  telegram: 'https://t.me/Icepanelsinfo',
  instagram: 'https://www.instagram.com/ice_panels?igsh=MTM3ZGc3NDhsZDYzMw==',
  facebook: 'https://www.facebook.com'
};

const getSuperAdminDoc = async () => {
  let superAdmin = await Admin.findOne({ role: 'superadmin' });
  if (!superAdmin) {
    superAdmin = await Admin.findOne({ username: 'superadmin' });
  }
  return superAdmin;
};

const getOrCreateSuperAdminLinks = async () => {
  let links = await SupportLink.findOne({ role: 'superadmin' });
  if (!links) {
    const superAdmin = await getSuperAdminDoc();
    const adminId = superAdmin ? superAdmin._id.toString() : 'superadmin';
    links = await SupportLink.findOneAndUpdate(
      { adminId },
      {
        $setOnInsert: {
          adminId,
          role: 'superadmin',
          ...DEFAULT_LINKS
        }
      },
      { new: true, upsert: true }
    );
  }
  return links;
};

/**
 * Get dynamic support links based on the requester's role & assignment
 */
exports.getSupportLinks = async (req, res) => {
  try {
    const adminId = req.headers['x-admin-id'] || req.query.adminId;
    const userId = req.headers['x-user-id'] || req.query.userId || adminId;
    const targetAdminId = req.headers['x-target-admin-id'] || req.query.targetAdminId;

    const superadminLinks = await getOrCreateSuperAdminLinks();

    // If no user or admin ID provided, treat as guest visitor (show Superadmin links)
    if (!userId && !adminId) {
      return res.status(200).json({
        role: 'guest',
        canEdit: false,
        links: {
          whatsappSupport: superadminLinks.whatsappSupport,
          whatsappChannel: superadminLinks.whatsappChannel,
          telegram: superadminLinks.telegram,
          instagram: superadminLinks.instagram,
          facebook: superadminLinks.facebook,
        }
      });
    }

    // Check if requester is an Admin or Superadmin
    let admin = null;
    const lookupId = adminId || userId;
    if (mongoose.Types.ObjectId.isValid(lookupId)) {
      admin = await Admin.findById(lookupId);
    }
    if (!admin && typeof lookupId === 'string') {
      admin = await Admin.findOne({ username: lookupId });
    }

    if (admin) {
      if (admin.role === 'superadmin') {
        // Fetch subadmins list so superadmin can choose any subadmin to inspect/edit
        const subAdmins = await Admin.find({ role: 'admin' }).select('_id username name agentCode');

        let selectedAdminLinks = superadminLinks;
        let selectedAdmin = null;

        if (targetAdminId && targetAdminId !== 'superadmin') {
          if (mongoose.Types.ObjectId.isValid(targetAdminId)) {
            selectedAdmin = await Admin.findById(targetAdminId);
          }
          if (!selectedAdmin && typeof targetAdminId === 'string') {
            selectedAdmin = await Admin.findOne({ username: targetAdminId });
          }

          if (selectedAdmin) {
            const foundDoc = await SupportLink.findOne({
              $or: [
                { adminId: selectedAdmin._id.toString() },
                ...(selectedAdmin.username ? [{ adminId: selectedAdmin.username }] : [])
              ]
            });
            selectedAdminLinks = foundDoc || DEFAULT_LINKS;
          }
        }

        return res.status(200).json({
          role: 'superadmin',
          canEdit: true,
          selectedTargetAdminId: selectedAdmin ? selectedAdmin._id.toString() : 'superadmin',
          subAdmins: subAdmins.map(s => ({ id: s._id.toString(), username: s.username, name: s.name, agentCode: s.agentCode })),
          myLinks: {
            whatsappSupport: selectedAdminLinks.whatsappSupport || DEFAULT_LINKS.whatsappSupport,
            whatsappChannel: selectedAdminLinks.whatsappChannel || DEFAULT_LINKS.whatsappChannel,
            telegram: selectedAdminLinks.telegram || DEFAULT_LINKS.telegram,
            instagram: selectedAdminLinks.instagram || DEFAULT_LINKS.instagram,
            facebook: selectedAdminLinks.facebook || DEFAULT_LINKS.facebook
          },
          superadminLinks: {
            whatsappSupport: superadminLinks.whatsappSupport,
            whatsappChannel: superadminLinks.whatsappChannel,
            telegram: superadminLinks.telegram,
            instagram: superadminLinks.instagram,
            facebook: superadminLinks.facebook
          }
        });
      }

      // Requester is a Sub-Admin:
      // Permission check: if canManageSupportLinks is false, subadmin can only see links like user (not editable)
      const hasSupportPermission = Boolean(admin.permissions && admin.permissions.canManageSupportLinks === true);

      let subAdminLinks = await SupportLink.findOne({
        $or: [
          { adminId: admin._id.toString() },
          ...(admin.username ? [{ adminId: admin.username }] : [])
        ]
      });
      if (!subAdminLinks) {
        subAdminLinks = DEFAULT_LINKS;
      }

      const defaultAdminWa = admin.phoneNumber ? `https://wa.me/${admin.phoneNumber.replace(/\D/g, '')}` : DEFAULT_LINKS.whatsappSupport;

      return res.status(200).json({
        role: 'admin',
        canEdit: hasSupportPermission,
        hasPermission: hasSupportPermission,
        superadminLinks: {
          whatsappSupport: superadminLinks.whatsappSupport,
          whatsappChannel: superadminLinks.whatsappChannel,
          telegram: superadminLinks.telegram,
          instagram: superadminLinks.instagram,
          facebook: superadminLinks.facebook
        },
        myLinks: {
          whatsappSupport: subAdminLinks.whatsappSupport || defaultAdminWa,
          whatsappChannel: subAdminLinks.whatsappChannel || DEFAULT_LINKS.whatsappChannel,
          telegram: subAdminLinks.telegram || DEFAULT_LINKS.telegram,
          instagram: subAdminLinks.instagram || DEFAULT_LINKS.instagram,
          facebook: subAdminLinks.facebook || DEFAULT_LINKS.facebook
        }
      });
    }

    // Requester is an End-User
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && typeof userId === 'string') {
      user = await User.findOne({ username: userId });
    }

    if (!user) {
      // Fallback: return default superadmin links
      return res.status(200).json({
        role: 'user',
        canEdit: false,
        links: {
          whatsappSupport: superadminLinks.whatsappSupport,
          whatsappChannel: superadminLinks.whatsappChannel,
          telegram: superadminLinks.telegram,
          instagram: superadminLinks.instagram,
          facebook: superadminLinks.facebook
        }
      });
    }

    // Resolve assigned sub-admin
    let assignedAdminId = user.assignedAdmin ? user.assignedAdmin.toString() : null;
    let parentAdmin = null;

    if (assignedAdminId && mongoose.Types.ObjectId.isValid(assignedAdminId)) {
      parentAdmin = await Admin.findById(assignedAdminId);
    }
    if (!parentAdmin && assignedAdminId) {
      parentAdmin = await Admin.findOne({ username: assignedAdminId });
    }
    if (!parentAdmin && user.assignedAdminUsername) {
      parentAdmin = await Admin.findOne({ username: user.assignedAdminUsername });
    }
    if (parentAdmin) {
      assignedAdminId = parentAdmin._id.toString();
    }

    let resolvedLinks = null;

    if (parentAdmin) {
      if (parentAdmin.role === 'superadmin') {
        resolvedLinks = {
          whatsappSupport: superadminLinks.whatsappSupport,
          whatsappChannel: superadminLinks.whatsappChannel,
          telegram: superadminLinks.telegram,
          instagram: superadminLinks.instagram,
          facebook: superadminLinks.facebook,
        };
      } else {
        // Look for Admin Master's custom support links
        const subAdminLinkDoc = await SupportLink.findOne({
          $or: [
            { adminId: assignedAdminId },
            ...(parentAdmin.username ? [{ adminId: parentAdmin.username }] : [])
          ]
        });

        const fallbackWa = parentAdmin.phoneNumber ? `https://wa.me/${parentAdmin.phoneNumber.replace(/\D/g, '')}` : DEFAULT_LINKS.whatsappSupport;

        if (subAdminLinkDoc) {
          resolvedLinks = {
            whatsappSupport: subAdminLinkDoc.whatsappSupport || fallbackWa,
            whatsappChannel: subAdminLinkDoc.whatsappChannel || DEFAULT_LINKS.whatsappChannel,
            telegram: subAdminLinkDoc.telegram || DEFAULT_LINKS.telegram,
            instagram: subAdminLinkDoc.instagram || DEFAULT_LINKS.instagram,
            facebook: subAdminLinkDoc.facebook || DEFAULT_LINKS.facebook,
          };
        } else {
          // If Admin Master hasn't configured custom links yet, provide default links with their phone number if available
          resolvedLinks = {
            ...DEFAULT_LINKS,
            whatsappSupport: fallbackWa
          };
        }
      }
    }

    // Fallback if user has no assigned admin
    if (!resolvedLinks) {
      resolvedLinks = {
        whatsappSupport: superadminLinks.whatsappSupport,
        whatsappChannel: superadminLinks.whatsappChannel,
        telegram: superadminLinks.telegram,
        instagram: superadminLinks.instagram,
        facebook: superadminLinks.facebook
      };
    }

    return res.status(200).json({
      role: 'user',
      canEdit: false,
      links: resolvedLinks
    });

  } catch (error) {
    console.error('Error fetching support links:', error);
    return res.status(500).json({ message: 'Failed to fetch support links', error: error.message });
  }
};

/**
 * Update support links (Admin & Superadmin only)
 * - Superadmin can update superadmin links OR any target sub-admin's links
 * - Sub-admin can only update their own links if they have 'canManageSupportLinks' permission
 */
exports.updateSupportLinks = async (req, res) => {
  try {
    const adminId = req.headers['x-admin-id'] || req.body.adminId || req.query.adminId;
    const requestedTarget = req.headers['x-target-admin-id'] || req.body.targetAdminId || req.query.targetAdminId;
    const { whatsappSupport, whatsappChannel, telegram, instagram, facebook } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required: Admin ID is missing.' });
    }

    let admin = null;
    if (mongoose.Types.ObjectId.isValid(adminId)) {
      admin = await Admin.findById(adminId);
    }
    if (!admin && typeof adminId === 'string') {
      admin = await Admin.findOne({ username: adminId });
    }

    if (!admin) {
      return res.status(403).json({ message: 'Only administrators can update support links.' });
    }

    const isSuperAdmin = admin.role === 'superadmin';

    // Sub-admin permission validation
    if (!isSuperAdmin) {
      if (!admin.permissions || admin.permissions.canManageSupportLinks !== true) {
        return res.status(403).json({
          message: 'Permission denied: You do not have permission to edit contact support links.'
        });
      }
    }

    // Determine target admin ID & target role
    let targetAdminId = admin._id.toString();
    let targetRole = 'admin';

    if (isSuperAdmin) {
      if (requestedTarget && requestedTarget !== 'superadmin') {
        // Superadmin updating a specific sub-admin's links
        let targetSubAdmin = null;
        if (mongoose.Types.ObjectId.isValid(requestedTarget)) {
          targetSubAdmin = await Admin.findById(requestedTarget);
        }
        if (!targetSubAdmin && typeof requestedTarget === 'string') {
          targetSubAdmin = await Admin.findOne({ username: requestedTarget });
        }

        if (targetSubAdmin) {
          targetAdminId = targetSubAdmin._id.toString();
          targetRole = 'admin';
        } else {
          return res.status(404).json({ message: 'Target sub-admin not found.' });
        }
      } else {
        // Superadmin updating superadmin links
        targetAdminId = admin._id ? admin._id.toString() : 'superadmin';
        targetRole = 'superadmin';
      }
    }

    const updatePayload = {};
    if (typeof whatsappSupport === 'string') updatePayload.whatsappSupport = whatsappSupport.trim();
    if (typeof whatsappChannel === 'string') updatePayload.whatsappChannel = whatsappChannel.trim();
    if (typeof telegram === 'string') updatePayload.telegram = telegram.trim();
    if (typeof instagram === 'string') updatePayload.instagram = instagram.trim();
    if (typeof facebook === 'string') updatePayload.facebook = facebook.trim();

    const query = targetRole === 'superadmin' ? { role: 'superadmin' } : { adminId: targetAdminId };

    const updatedDoc = await SupportLink.findOneAndUpdate(
      query,
      {
        $set: {
          adminId: targetAdminId,
          role: targetRole,
          ...updatePayload
        }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: 'Support links updated successfully.',
      targetAdminId,
      role: targetRole,
      links: {
        whatsappSupport: updatedDoc.whatsappSupport,
        whatsappChannel: updatedDoc.whatsappChannel,
        telegram: updatedDoc.telegram,
        instagram: updatedDoc.instagram,
        facebook: updatedDoc.facebook
      }
    });

  } catch (error) {
    console.error('Error updating support links:', error);
    return res.status(500).json({ message: 'Failed to update support links', error: error.message });
  }
};
