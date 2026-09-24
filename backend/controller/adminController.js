const Admin = require('../models/Admin');
const User = require('../models/User');
const WebsiteId = require('../models/WebsiteId');
const Transaction = require('../models/Transaction');
const AdminAccount = require('../models/AdminAccount');
const Website = require('../models/Website');
const Carousel = require('../models/Carousel');
const Category = require('../models/Category');
const IdRequest = require('../models/IdRequest');
const CloseRequest = require('../models/CloseRequest');
const PasswordChangeRequest = require('../models/PasswordChangeRequest');
const ClosedId = require('../models/ClosedId');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getAdminFromReq, getAdminUserIdentifiers } = require('./subAdminHelper');

// Fetch all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    const formattedAdmins = admins.map(doc => {
      const obj = doc.toObject();
      delete obj.password;
      return {
        id: doc._id,
        ...obj,
      };
    });
    res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error retrieving admins', error: error.message });
  }
};

// Sub-admin management (Superadmin only)
exports.getAllSubAdmins = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.role !== 'master') {
      return res.status(403).json({ message: 'Access denied. Superadmin or Master only.' });
    }

    const subAdmins = await Admin.find({ role: { $ne: 'superadmin' } }).sort({ createdAt: -1 });
    const subAdminsWithStats = await Promise.all(
      subAdmins.map(async (doc) => {
        const userCount = await User.countDocuments({ assignedAdmin: doc._id });
        const bankAccount = await AdminAccount.findOne({
          $or: [{ userId: doc._id.toString() }, { userId: doc.username }]
        });
        const adminObj = doc.toObject();
        delete adminObj.password;
        return {
          id: doc._id,
          ...adminObj,
          userCount,
          bankDetails: bankAccount ? {
            bankName: bankAccount.bankName || 'XYZ Bank',
            accountHolderName: bankAccount.accountHolderName || doc.name || doc.username,
            accountNumber: bankAccount.accountNumber || '1234567890',
            ifscCode: bankAccount.ifscCode || 'ABCD0123456',
            upiId: bankAccount.upiId || `${doc.username}@upi`,
          } : {
            bankName: "HDFC Bank",
            accountHolderName: doc.name || doc.username,
            accountNumber: "50100" + Math.floor(10000000 + Math.random() * 90000000),
            ifscCode: "HDFC0001234",
            upiId: `${doc.username}@upi`,
          }
        };
      })
    );
    res.status(200).json(subAdminsWithStats);
  } catch (error) {
    console.error('Error fetching sub-admins:', error);
    res.status(500).json({ message: 'Error retrieving sub-admins', error: error.message });
  }
};

exports.createSubAdmin = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin only.' });
    }

    const { username, password, name, email, phoneNumber, agentCode, permissions } = req.body;
    if (!username || !password || !name || !email || !phoneNumber) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const newAdmin = new Admin({
      username,
      password,
      name,
      email,
      phoneNumber,
      agentCode: agentCode || '',
      role: 'admin',
      permissions: permissions || {
        canCreateUsers: true,
        canUpdateUserBalance: true,
        canChangeUserPassword: true,
        canDeleteUsers: false,
        canAddWebsites: true,
        canEditWebsites: true,
        canDeleteWebsites: false,
        canManageCategories: true,
        canManageIdRequests: true,
        canManageTransactions: true,
        canEditIdCredentials: true,
        canManageBanners: false,
        canManageSupportLinks: false,
      },
    });

    await newAdmin.save();
    const savedObj = newAdmin.toObject();
    delete savedObj.password;

    res.status(201).json({
      message: 'Sub-admin created successfully',
      admin: { id: newAdmin._id, ...savedObj },
    });
  } catch (error) {
    console.error('Error creating sub-admin:', error);
    res.status(500).json({ message: 'Error creating sub-admin', error: error.message });
  }
};

exports.updateSubAdminPermissions = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin only.' });
    }

    const { id } = req.params;
    const { permissions } = req.body;

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found.' });
    }

    targetAdmin.permissions = {
      ...(targetAdmin.permissions ? targetAdmin.permissions.toObject() : {}),
      ...permissions,
    };

    await targetAdmin.save();

    res.status(200).json({
      message: 'Permissions updated successfully',
      permissions: targetAdmin.permissions,
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Error updating permissions', error: error.message });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin only.' });
    }

    const { id } = req.params;
    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found.' });
    }

    if (targetAdmin.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot delete Superadmin.' });
    }

    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: 'Sub-admin deleted successfully.' });
  } catch (error) {
    console.error('Error deleting sub-admin:', error);
    res.status(500).json({ message: 'Error deleting sub-admin', error: error.message });
  }
};

// Create user from Admin Panel
exports.addAdminUser = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canCreateUsers === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot create users.' });
    }

    const { name, phoneNumber, email, password, username, agentCode, targetAdminId } = req.body;

    if (!name || !phoneNumber || !email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    let assignedAdminId = null;
    let assignedAdminUsername = '';
    let finalAgentCode = '';

    if (agentCode && agentCode.trim() !== '') {
      const targetAdminByCode = await Admin.findOne({ agentCode: agentCode.trim(), status: 'active' });
      if (targetAdminByCode) {
        assignedAdminId = targetAdminByCode._id;
        assignedAdminUsername = targetAdminByCode.username;
        finalAgentCode = targetAdminByCode.agentCode;
      } else {
        // Fallback to super admin if agent code does not match
        const superAdmin = await Admin.findOne({ role: 'superadmin', status: 'active' });
        if (superAdmin) {
          assignedAdminId = superAdmin._id;
          assignedAdminUsername = superAdmin.username;
          finalAgentCode = agentCode.trim();
        }
      }
    } else {
      // Original logic if no explicit agentCode was provided
      if (admin?.role === 'superadmin' && targetAdminId) {
        assignedAdminId = targetAdminId;
        const targetAdmin = await Admin.findById(targetAdminId);
        if (targetAdmin) {
          assignedAdminUsername = targetAdmin.username;
          finalAgentCode = targetAdmin.agentCode || '';
        }
      } else if (admin) {
        assignedAdminId = admin._id;
        assignedAdminUsername = admin.username;
        finalAgentCode = admin.agentCode || '';
      }
    }

    const newUser = new User({
      name,
      phoneNumber,
      email: email.toLowerCase(),
      password,
      username,
      agentCode: finalAgentCode,
      balance: 0,
      role: 'user',
      assignedAdmin: assignedAdminId,
      assignedAdminUsername,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser._id, ...newUser.toObject() },
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
};

// Update Sub-Admin details
exports.updateSubAdmin = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin only.' });
    }

    const { id } = req.params;
    const { name, phoneNumber, email, password, username, agentCode } = req.body;

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found.' });
    }

    if (name) targetAdmin.name = name;
    if (phoneNumber) targetAdmin.phoneNumber = phoneNumber;
    if (email) targetAdmin.email = email.toLowerCase();
    if (username) {
      const existing = await Admin.findOne({ username, _id: { $ne: id } });
      if (existing) return res.status(400).json({ message: 'Username is already taken.' });
      targetAdmin.username = username;
    }
    if (password && password.trim() !== '') {
      targetAdmin.password = password;
    }
    if (agentCode !== undefined) {
      targetAdmin.agentCode = agentCode;
    }

    await targetAdmin.save();

    const savedObj = targetAdmin.toObject();
    delete savedObj.password;

    res.status(200).json({
      message: 'Sub-admin updated successfully',
      admin: { id: targetAdmin._id, ...savedObj },
    });
  } catch (error) {
    console.error('Error updating sub-admin:', error);
    res.status(500).json({ message: 'Error updating sub-admin', error: error.message });
  }
};

// Update User details
exports.updateUser = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canCreateUsers === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage users.' });
    }

    const { id } = req.params;
    const { name, phoneNumber, email, password, username, agentCode } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (admin && admin.role !== 'superadmin') {
       if (targetUser.assignedAdmin?.toString() !== admin._id.toString() &&
           targetUser.assignedAdminUsername !== admin.username) {
          return res.status(403).json({ message: 'Access denied: You do not manage this user.' });
       }
    }

    if (name) targetUser.name = name;
    if (phoneNumber) targetUser.phoneNumber = phoneNumber;
    if (email) targetUser.email = email.toLowerCase();
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: id } });
      if (existing) return res.status(400).json({ message: 'Username is already taken.' });
      targetUser.username = username;
    }
    if (password && password.trim() !== '') {
      targetUser.password = password;
    }
    if (agentCode !== undefined) {
      targetUser.agentCode = agentCode;
      
      if (agentCode.trim() !== '') {
        const targetAdminByCode = await Admin.findOne({ agentCode: agentCode.trim(), status: 'active' });
        if (targetAdminByCode) {
          targetUser.assignedAdmin = targetAdminByCode._id;
          targetUser.assignedAdminUsername = targetAdminByCode.username;
        } else {
          const superAdmin = await Admin.findOne({ role: 'superadmin', status: 'active' });
          if (superAdmin) {
            targetUser.assignedAdmin = superAdmin._id;
            targetUser.assignedAdminUsername = superAdmin.username;
          }
        }
      }
    }

    await targetUser.save();

    const savedObj = targetUser.toObject();
    delete savedObj.password;

    res.status(200).json({
      message: 'User updated successfully',
      user: { id: targetUser._id, ...savedObj },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Fetch all users (with sub-admin tenant isolation)
exports.getAllUsers = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    let filter = {};

    if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        const adminObjId = mongoose.Types.ObjectId.isValid(filterAdminId)
          ? new mongoose.Types.ObjectId(filterAdminId)
          : null;
        filter = {
          $or: [
            { assignedAdmin: filterAdminId },
            ...(adminObjId ? [{ assignedAdmin: adminObjId }] : []),
          ],
        };
      }
    } else if (admin) {
      const adminObjId = mongoose.Types.ObjectId.isValid(admin._id)
        ? admin._id
        : null;
      const orConditions = [
        { assignedAdmin: admin._id.toString() },
      ];
      if (adminObjId) {
        orConditions.push({ assignedAdmin: adminObjId });
      }
      if (admin.username) {
        orConditions.push({ assignedAdminUsername: admin.username });
      }
      if (admin.agentCode) {
        orConditions.push({ agentCode: admin.agentCode });
      }
      filter = { $or: orConditions };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const formattedUsers = users.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};




// Controller to fetch all IDs (tenant-isolated)
exports.getAllIds = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    let idFilter = {};

    if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        const { ids, usernames } = await getAdminUserIdentifiers(filterAdminId);
        idFilter = {
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: [...ids, ...usernames] } }
          ]
        };
      }
    } else if (admin) {
      const { ids, usernames } = await getAdminUserIdentifiers(admin._id.toString());
      idFilter = {
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: [...ids, ...usernames] } }
        ]
      };
    }

    const ids = await WebsiteId.find(idFilter).sort({ createdAt: -1 });

    if (ids.length === 0) {
      return res.status(200).json([]);
    }

    const formattedIds = ids.map(doc => {
      const obj = doc.toObject();
      return {
        id: doc._id,
        ...obj
      };
    });

    res.status(200).json(formattedIds);
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Failed to fetch IDs" });
  }
};

// Get admin balance
// Get admin balance
exports.getAdminBalance = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const balance = admin.balance || 0;

    res.status(200).json({
      balance: balance,
      adminId: adminId
    });
  } catch (error) {
    console.error('Error fetching admin balance:', error);
    res.status(500).json({ message: 'Error fetching admin balance', error: error.message });
  }
};

exports.updateProfileController = async (req, res) => {
  try {
    const { id, userId, name, email, phoneNumber, username, password } = req.body;
    const targetId = id || userId;

    if (!targetId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const admin = await Admin.findById(targetId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (password) admin.password = password;

    // Requirement: Superadmin username cannot be changed
    if (username) {
      if (admin.role === 'superadmin' && username !== 'superadmin') {
        return res.status(400).json({ message: "Superadmin username cannot be changed." });
      }
      if (admin.role !== 'superadmin') {
        admin.username = username;
      }
    }

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: { id: admin._id, ...admin.toObject() },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Add a new admin (Signup)
// Add a new admin (Signup)
exports.addAdmin = async (req, res) => {
  const { name, phoneNumber, email, password, username } = req.body;

  // Basic validation
  if (!name || !phoneNumber || !email || !password || !username) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check for duplicate username
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const newAdmin = new Admin({
      name,
      phoneNumber,
      email,
      password,
      username,
      role: 'admin',
      balance: 0
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin signed up successfully', admin: { id: newAdmin._id, ...newAdmin.toObject() } });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ message: 'Error adding admin', error: error.message });
  }
};


// Controller for handling the addition of a new website
exports.addWebsite = async (req, res) => {
  const { website, url, minimumCoins, category, targetAdminId, description } = req.body;

  // Validation: Ensure all fields are provided
  if (!website || !url || !minimumCoins) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canAddWebsites === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot add websites.' });
    }

    let logoPath = '';
    if (req.file) {
      logoPath = req.file.path; // Cloudinary URL
    }

    // Determine adminId for the website:
    // If superadmin provided targetAdminId, use that; otherwise use admin's own ID
    let assignedAdminId = '';
    if (admin?.role === 'superadmin') {
      assignedAdminId = targetAdminId || admin._id.toString();
    } else if (admin) {
      assignedAdminId = admin._id.toString();
    }

    const newWebsite = new Website({
      website,
      url,
      minimumCoins: parseInt(minimumCoins, 10),
      category: category || '', // Add category field
      logo: logoPath,
      adminId: assignedAdminId,
      description: description || '',
    });

    await newWebsite.save();

    res.status(201).json({
      message: 'Website added successfully',
      website: { id: newWebsite._id, ...newWebsite.toObject() }
    });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ message: 'Error adding website', error: error.message });
  }
};


// Update transaction details by admin
// Update transaction details by admin
exports.updateTransaction = async (req, res) => {
  const { id, transactionId, acceptedAt, status } = req.body;

  // Validation: Ensure `id` is provided
  if (!id) {
    return res.status(400).json({ message: 'Transaction ID (id) is required for updating.' });
  }

  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Update only the fields provided in the request
    if (transactionId) transaction.transactionId = transactionId;
    if (acceptedAt) transaction.acceptedAt = acceptedAt;
    if (status) transaction.status = status;

    await transaction.save();

    res.status(200).json({
      message: 'Transaction updated successfully',
      updatedTransaction: { id, ...transaction.toObject() }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};


exports.updateIdStatus = async (req, res) => {
  const { id } = req.body;

  // Validation: Ensure ID is provided
  if (!id) {
    return res.status(400).json({ message: 'ID is required to update the status.' });
  }

  try {
    const websiteId = await WebsiteId.findById(id);

    if (!websiteId) {
      return res.status(404).json({ message: 'Website record not found.' });
    }

    websiteId.status = 'Accepted';
    await websiteId.save();

    res.status(200).json({
      message: 'Website status updated to Accepted.',
      updatedWebsite: { id, status: 'Accepted' },
    });
  } catch (error) {
    console.error('Error updating website status:', error);
    res.status(500).json({ message: 'Error updating website status', error: error.message });
  }
};

// Controller function to fetch all transactions (tenant-isolated for sub-admins)
exports.getAllTransactions = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    let txnFilter = {};

    if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        const { ids, usernames } = await getAdminUserIdentifiers(filterAdminId);
        txnFilter = {
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: [...ids, ...usernames] } }
          ]
        };
      }
    } else if (admin) {
      const { ids, usernames } = await getAdminUserIdentifiers(admin._id.toString());
      txnFilter = {
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: [...ids, ...usernames] } }
        ]
      };
    }

    const transactions = await Transaction.find(txnFilter).sort({ createdAt: -1 });

    if (transactions.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch all users to map names
    const users = await User.find({}, 'username name');
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.name;
      if (user.username) userMap[user.username] = user.name;
    });

    const formattedTransactions = transactions.map(doc => {
      const docObj = doc.toObject();
      let userName = 'Unknown';

      if (userMap[doc.createdBy]) {
        userName = userMap[doc.createdBy];
      } else if (mongoose.Types.ObjectId.isValid(doc.createdBy) && userMap[doc.createdBy.toString()]) {
        userName = userMap[doc.createdBy.toString()];
      }

      return {
        id: doc._id,
        ...docObj,
        userDetails: { name: userName }
      };
    });

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

// Controller to accept a transaction
exports.acceptTransaction = async (req, res) => {
  const txnId = req.params.txnId;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const transaction = await Transaction.findById(txnId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status === 'Completed' || transaction.status === 'Accepted') {
      return res.status(400).json({ message: 'Transaction already completed' });
    }

    transaction.status = 'Completed';
    transaction.acceptedAt = new Date().toISOString();
    await transaction.save();

    // Determine if it is a withdrawal or a deposit
    const isWithdrawal = transaction.paymentMethod === 'Withdraw From Wallet' ||
      transaction.transactionType === 'withdrawal' ||
      transaction.transactionType === 'wallet_withdrawal';

    // Update user balance based on transaction type
    let user;
    if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
      user = await User.findById(transaction.createdBy);
    }

    if (!user) {
      user = await User.findOne({ username: transaction.createdBy });
    }

    if (user) {
      const currentBalance = user.balance || 0;
      let newBalance = currentBalance;

      if (!isWithdrawal) {
        newBalance = currentBalance + parseFloat(transaction.amount);
      } else {
        newBalance = Math.max(0, currentBalance - parseFloat(transaction.amount));
      }

      user.balance = newBalance;
      await user.save();
    }

    res.status(200).json({ message: 'Transaction accepted', transactionId: txnId, status: 'Completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept transaction', error: error.message });
  }
};

// Controller to reject a transaction
exports.rejectTransaction = async (req, res) => {
  const txnId = req.params.txnId;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const transaction = await Transaction.findById(txnId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'Failed';
    await transaction.save();

    res.status(200).json({ message: 'Transaction rejected', transactionId: txnId, status: 'Failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reject transaction', error: error.message });
  }
};



// Update user balance
exports.updateUserBalance = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;

  if (balance === undefined || balance === null || balance === '') {
    return res.status(400).json({ message: 'Balance is required' });
  }

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canUpdateUserBalance === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot update user balance.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (admin && admin.role !== 'superadmin' && user.assignedAdmin && user.assignedAdmin.toString() !== admin._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: User is assigned to another administrator.' });
    }

    user.balance = parseFloat(balance);
    await user.save();

    res.status(200).json({ id, balance: user.balance });
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ message: 'Error updating user balance', error: error.message });
  }
};

// Update user agent code
exports.updateUserAgentCode = async (req, res) => {
  const { id } = req.params;
  const { agentCode } = req.body;

  if (typeof agentCode === 'undefined') {
    return res.status(400).json({ message: 'Agent code is required' });
  }

  try {
    const admin = await getAdminFromReq(req);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (admin && admin.role !== 'superadmin' && user.assignedAdmin && user.assignedAdmin.toString() !== admin._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: User is assigned to another administrator.' });
    }

    user.agentCode = agentCode;
    await user.save();

    res.status(200).json({ id, agentCode });
  } catch (error) {
    console.error('Error updating user agent code:', error);
    res.status(500).json({ message: 'Error updating user agent code', error: error.message });
  }
};




// Get Account Details (per-admin or fallback)
exports.getAccountDetails = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    const targetUserId = req.query.userId || admin?._id?.toString() || "1";

    let userAccount = await AdminAccount.findOne({ userId: targetUserId });

    if (!userAccount) {
      // Fallback to "1"
      userAccount = await AdminAccount.findOne({ userId: "1" });
    }

    if (!userAccount) {
      return res.status(200).json({
        accountNumber: "1234567890",
        accountHolderName: "Admin",
        ifscCode: "ABCD0123456",
        bankName: "XYZ Bank",
        upiId: "sample@upi"
      });
    }

    return res.status(200).json({
      accountNumber: userAccount.accountNumber || '',
      accountHolderName: userAccount.accountHolderName || '',
      ifscCode: userAccount.ifscCode || '',
      bankName: userAccount.bankName || '',
      upiId: userAccount.upiId || ''
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateAccountDetails = async (req, res) => {
  const { accountNumber, accountHolderName, ifscCode, bankName, upiId } = req.body;
  const admin = await getAdminFromReq(req);
  const userId = req.body.userId || admin?._id?.toString() || "1";

  try {
    const defaultData = {
      accountNumber: "1234567890",
      accountHolderName: "Admin",
      ifscCode: "ABCD0123456",
      bankName: "XYZ Bank",
      upiId: "sample@upi",
    };

    const updatedData = {
      accountNumber: accountNumber || defaultData.accountNumber,
      accountHolderName: accountHolderName || defaultData.accountHolderName,
      ifscCode: ifscCode || defaultData.ifscCode,
      bankName: bankName || defaultData.bankName,
      upiId: upiId || defaultData.upiId,
    };

    const account = await AdminAccount.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Account details updated successfully",
      updatedAccount: { userId, ...updatedData },
    });
  } catch (error) {
    console.error('Error updating account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Get Account Details (First Record)
// Get Account Details (First Record)
exports.getAccountDetailsDeposit = async (req, res) => {
  try {
    const userAccount = await AdminAccount.findOne();

    if (!userAccount) {
      return res.status(404).json({ message: "No account found" });
    }

    return res.status(200).json({
      accountNumber: userAccount.accountNumber,
      accountHolderName: userAccount.accountHolderName,
      ifscCode: userAccount.ifscCode,
      bankName: userAccount.bankName,
      upiId: userAccount.upiId,
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.acceptId = async (req, res) => {
  const { id } = req.body;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = idDoc.adminId === admin._id.toString() || allowedIdentifiers.includes(idDoc.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: ID does not belong to your assigned users.' });
      }
    }

    idDoc.status = 'Created';
    await idDoc.save();

    res.status(200).json({ message: 'ID Accepted', id: id, status: 'Created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept ID', error: error.message });
  }
};

exports.rejectId = async (req, res) => {
  const { id } = req.body;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = idDoc.adminId === admin._id.toString() || allowedIdentifiers.includes(idDoc.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: ID does not belong to your assigned users.' });
      }
    }

    idDoc.status = 'Username Exists';
    await idDoc.save();

    res.status(200).json({ message: 'ID rejected due to username already exist', id: id, status: 'Username Already Exist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reject ID', error: error.message });
  }
};

// Controller to update ID information (username, password, comment)
exports.updateId = async (req, res) => {
  const { id, username, password, comment } = req.body;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canEditIdCredentials === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot edit ID credentials.' });
    }

    // Validation: Ensure required fields are provided
    if (!id) {
      return res.status(400).json({ message: 'ID is required to update the information.' });
    }

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = idDoc.adminId === admin._id.toString() || allowedIdentifiers.includes(idDoc.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: ID does not belong to your assigned users.' });
      }
    }

    idDoc.username = username.trim();
    idDoc.password = password.trim();
    idDoc.updatedAt = new Date().toISOString();

    if (comment && comment.trim()) {
      idDoc.comment = comment.trim();
    }

    await idDoc.save();

    res.status(200).json({
      message: 'ID information updated successfully',
      id: { id: idDoc._id, ...idDoc.toObject() }
    });
  } catch (error) {
    console.error('Error updating ID:', error);
    res.status(500).json({ message: 'Failed to update ID information', error: error.message });
  }
};


// Controller for updating a website
exports.updateWebsite = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canEditWebsites === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot edit websites.' });
    }

    const { id } = req.params;
    const { website: newName, url, minimumCoins, category, description } = req.body;

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    if (admin && admin.role !== 'superadmin' && website.adminId && website.adminId !== admin._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Website does not belong to your account.' });
    }

    if (newName) website.website = newName;
    if (url) website.url = url;

    if (minimumCoins) website.minimumCoins = parseInt(minimumCoins, 10);
    if (category !== undefined) website.category = category;
    if (description !== undefined) website.description = description;

    if (req.file) {
      website.logo = req.file.path; // Cloudinary URL
    }

    await website.save();

    res.status(200).json({
      message: 'Website updated successfully.',
      website: { id: website._id, ...website.toObject() }
    });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller to fetch all websites (tenant-isolated for sub-admins & users)
exports.getAllWebsites = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    const userId = req.query.userId;
    let filter = {};

    if (userId) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      } else {
        user = await User.findOne({ username: userId });
      }

      if (user && user.assignedAdmin) {
        filter = { adminId: user.assignedAdmin.toString() };
      } else {
        filter = {
          $or: [
            { adminId: '' },
            { adminId: null }
          ]
        };
      }
    } else if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        filter = { adminId: filterAdminId };
      }
    } else if (admin) {
      filter = { adminId: admin._id.toString() };
    }

    const websites = await Website.find(filter);

    const formattedWebsites = websites.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedWebsites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller to delete a website
exports.deleteWebsite = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canDeleteWebsites === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot delete websites.' });
    }

    const websiteId = req.params.id;
    const website = await Website.findById(websiteId);

    if (!website) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    if (admin && admin.role !== 'superadmin' && website.adminId && website.adminId !== admin._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Website does not belong to your account.' });
    }

    // Cloudinary cleanup for logo
    if (website.logo) {
      const urlParts = website.logo.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1) {
        const afterUpload = urlParts.slice(uploadIndex + 1);
        const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
        const publicIdWithExt = filtered.join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.warn('Cloudinary delete warning:', cloudErr.message);
        }
      }
    }

    await Website.findByIdAndDelete(websiteId);
    res.status(200).json({ message: 'Website and logo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
//corousel-->>>

exports.getAllTopCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'top' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getMiddleTopCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'middle' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllBottomCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'bottom' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllTopCardCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'topCard' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllBottomCardCorousel = async (req, res) => {
  try {
    const carouselImages = await Carousel.find({ type: 'bottomCard' });

    if (carouselImages.length === 0) {
      return res.status(404).json({ message: 'No carousel images found.' });
    }

    const formattedImages = carouselImages.map(doc => ({
      id: doc._id,
      ...doc.toObject(),
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addTopCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'top'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'middle'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addBottomCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'bottom'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addTopMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'topCard'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.addBottomMiddleCorousel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const imagePath = req.file.path; // Cloudinary URL

    const newCarouselImage = new Carousel({
      imagePath,
      type: 'bottomCard'
    });

    await newCarouselImage.save();

    res.status(201).json({
      message: 'Carousel image added successfully.',
      imagePath: newCarouselImage.imagePath,
    });
  } catch (error) {
    console.error('Error adding carousel image:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller to delete the first record from the topCarousel collection
// Controller to delete the first record from the topCarousel collection
exports.deleteOneTopCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'top' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the topCarousel collection' });
    }

    // Cloudinary cleanup
    const urlParts = firstRecord.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Carousel.findByIdAndDelete(firstRecord._id);
    res.status(200).json({ message: 'First record deleted successfully from the database and Cloudinary' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneMiddleCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'middle' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the middleCarousel collection' });
    }

    // Cloudinary cleanup
    const urlParts = firstRecord.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Carousel.findByIdAndDelete(firstRecord._id);
    res.status(200).json({ message: 'First record deleted successfully from the database and Cloudinary' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneBottomCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'bottom' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the bottomCarousel collection' });
    }

    // Cloudinary cleanup
    const urlParts = firstRecord.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Carousel.findByIdAndDelete(firstRecord._id);
    res.status(200).json({ message: 'First record deleted successfully from the database and Cloudinary' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneTopCardCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'topCard' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the topCardCarousel collection' });
    }

    // Cloudinary cleanup
    const urlParts = firstRecord.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Carousel.findByIdAndDelete(firstRecord._id);
    res.status(200).json({ message: 'First record deleted successfully from the database and Cloudinary' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};

exports.deleteOneBottomCardCarousel = async (req, res) => {
  try {
    const firstRecord = await Carousel.findOne({ type: 'bottomCard' });

    if (!firstRecord) {
      return res.status(404).json({ error: 'No records found in the bottomCardCarousel collection' });
    }

    // Cloudinary cleanup
    const urlParts = firstRecord.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Carousel.findByIdAndDelete(firstRecord._id);
    res.status(200).json({ message: 'First record deleted successfully from the database and Cloudinary' });
  } catch (error) {
    console.error('Error deleting first record:', error);
    res.status(500).json({ error: 'Failed to delete the first record' });
  }
};



// Controller to delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canDeleteUsers === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot delete users.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = (user.assignedAdmin && user.assignedAdmin.toString() === admin._id.toString()) ||
                      allowedIdentifiers.includes(user._id.toString()) ||
                      allowedIdentifiers.includes(user.username);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: User does not belong to your assigned users.' });
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Controller to change user password
exports.changeUserPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canChangeUserPassword === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot change user passwords.' });
    }

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = (user.assignedAdmin && user.assignedAdmin.toString() === admin._id.toString()) ||
                      allowedIdentifiers.includes(user._id.toString()) ||
                      allowedIdentifiers.includes(user.username);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: User does not belong to your assigned users.' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'User password changed successfully' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ message: 'Failed to change user password', error: error.message });
  }
};

// Get unique categories from existing websites
exports.getWebsiteCategories = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    const userId = req.query.userId;
    let websiteFilter = {};
    let categoryFilter = {};

    if (userId) {
      const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : await User.findOne({ username: userId });
      if (user?.assignedAdmin) {
        websiteFilter = { adminId: user.assignedAdmin.toString() };
        categoryFilter = { adminId: user.assignedAdmin.toString() };
      } else {
        websiteFilter = { $or: [{ adminId: '' }, { adminId: null }] };
        categoryFilter = { $or: [{ adminId: '' }, { adminId: null }] };
      }
    } else if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        websiteFilter = { adminId: filterAdminId };
        categoryFilter = { adminId: filterAdminId };
      }
    } else if (admin) {
      websiteFilter = { adminId: admin._id.toString() };
      categoryFilter = { adminId: admin._id.toString() };
    }

    // Get categories from websites
    const websites = await Website.find(websiteFilter);
    const websiteCategories = new Set();

    websites.forEach(website => {
      if (website.category && website.category.trim()) {
        websiteCategories.add(website.category.trim());
      }
    });

    // Get categories from categories collection
    const categories = await Category.find(categoryFilter);
    const dbCategories = [];

    categories.forEach(category => {
      if (category.name && category.name.trim()) {
        dbCategories.push(category);
        websiteCategories.add(category.name.trim());
      }
    });

    const allCategories = Array.from(websiteCategories).sort();

    res.status(200).json({
      message: "Categories retrieved successfully.",
      categories: allCategories,
      dbCategories: dbCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get all categories for dropdown (combines both sources)
exports.getAllCategoriesForDropdown = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    const userId = req.query.userId;
    let websiteFilter = {};
    let categoryFilter = {};

    if (userId) {
      const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : await User.findOne({ username: userId });
      if (user?.assignedAdmin) {
        websiteFilter = { adminId: user.assignedAdmin.toString() };
        categoryFilter = { adminId: user.assignedAdmin.toString() };
      } else {
        websiteFilter = { $or: [{ adminId: '' }, { adminId: null }] };
        categoryFilter = { $or: [{ adminId: '' }, { adminId: null }] };
      }
    } else if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        websiteFilter = { adminId: filterAdminId };
        categoryFilter = { adminId: filterAdminId };
      }
    } else if (admin) {
      websiteFilter = { adminId: admin._id.toString() };
      categoryFilter = { adminId: admin._id.toString() };
    }

    const websites = await Website.find(websiteFilter);
    const websiteCategories = new Set();

    websites.forEach(website => {
      if (website.category && website.category.trim()) {
        websiteCategories.add(website.category.trim());
      }
    });

    const categories = await Category.find(categoryFilter);
    const dbCategories = [];

    categories.forEach(category => {
      if (category.name && category.name.trim()) {
        dbCategories.push(category);
        websiteCategories.add(category.name.trim());
      }
    });

    const allCategories = Array.from(websiteCategories).sort();

    res.status(200).json({
      message: "All categories retrieved successfully.",
      categories: allCategories,
      dbCategories: dbCategories
    });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Remove/Delete a category (from Category collection and all websites)
exports.removeCategoryFromWebsites = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageCategories === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage categories.' });
    }

    const { categoryName, targetAdminId } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = categoryName.trim();
    const nameRegex = new RegExp(`^${trimmedName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

    let catQuery = { name: nameRegex };
    let webQuery = { category: nameRegex };

    if (admin?.role === 'superadmin' && targetAdminId) {
      catQuery.adminId = targetAdminId;
      webQuery.adminId = targetAdminId;
    } else if (admin && admin.role !== 'superadmin') {
      catQuery.adminId = admin._id.toString();
      webQuery.adminId = admin._id.toString();
    }

    // 1. Delete from Category collection
    const categoryDeleteResult = await Category.deleteMany(catQuery);

    // 2. Clear category on websites
    const websiteUpdateResult = await Website.updateMany(
      webQuery,
      { category: '' }
    );

    const affectedWebsites = websiteUpdateResult.modifiedCount || 0;
    const deletedCategories = categoryDeleteResult.deletedCount || 0;

    res.status(200).json({
      message: `Category "${trimmedName}" deleted successfully.${affectedWebsites > 0 ? ` Removed from ${affectedWebsites} website(s).` : ''}`,
      affectedWebsites,
      deletedCategories
    });
  } catch (error) {
    console.error('Error removing category:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageCategories === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage categories.' });
    }

    const { name, targetAdminId } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();

    let assignedAdminId = '';
    if (admin?.role === 'superadmin' && targetAdminId) {
      assignedAdminId = targetAdminId;
    } else if (admin) {
      assignedAdminId = admin._id.toString();
    }

    // Check if category already exists for this admin
    const existingCategory = await Category.findOne({
      name: trimmedName,
      adminId: assignedAdminId || ''
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }

    // Create a new category object
    const newCategory = new Category({
      name: trimmedName,
      adminId: assignedAdminId,
    });

    // Save the new category
    await newCategory.save();

    res.status(201).json({
      message: 'Category added successfully.',
      category: { id: newCategory._id, ...newCategory.toObject() },
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ===== REQUEST HANDLING APIs =====

// Get all pending requests (deposit, withdrawal, close ID, password change)
// Get all ID creation requests
// Get all ID creation requests
exports.getAllIdRequests = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    let filter = {};
    if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        const targetAdminUsers = await getAdminUserIdentifiers(filterAdminId);
        filter = {
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: targetAdminUsers } }
          ]
        };
      }
    } else if (admin) {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      filter = {
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: allowedIdentifiers } }
        ]
      };
    }

    const idRequests = await IdRequest.find(filter).sort({ createdAt: -1 });

    const formattedRequests = idRequests.map(doc => ({
      id: doc._id,
      ...doc.toObject()
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching ID requests:', error);
    res.status(500).json({ message: 'Error fetching ID requests', error: error.message });
  }
};

// Update ID request status (Accept/Reject)
exports.updateIdRequestStatus = async (req, res) => {
  const { requestId, status, adminNotes, processedBy } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ message: 'Request ID and status are required.' });
  }

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be either Accepted or Rejected.' });
  }

  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    const requestDoc = await IdRequest.findById(requestId);

    if (!requestDoc) {
      return res.status(404).json({ message: 'ID request not found.' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = requestDoc.adminId === admin._id.toString() || allowedIdentifiers.includes(requestDoc.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: ID request does not belong to your assigned users.' });
      }
    }

    const processedAt = new Date().toISOString();

    // Update the ID request
    requestDoc.status = status;
    requestDoc.processedAt = processedAt;
    requestDoc.processedBy = processedBy || admin?.username || 'admin';
    if (adminNotes) requestDoc.adminNotes = adminNotes;
    await requestDoc.save();

    // If accepted, create the actual ID
    if (status === 'Accepted') {
      let user;
      if (mongoose.Types.ObjectId.isValid(requestDoc.createdBy)) {
        user = await User.findById(requestDoc.createdBy);
      } else {
        user = await User.findOne({ username: requestDoc.createdBy });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Create the actual ID
      const newId = new WebsiteId({
        websiteName: requestDoc.websiteName,
        websiteUrl: requestDoc.websiteUrl,
        username: requestDoc.username,
        password: requestDoc.password || '',
        imgUrl: requestDoc.imgUrl,
        createdBy: requestDoc.createdBy,
        status: 'Active',
        createdAt: processedAt,
        idRequestId: requestId,
        balance: 0,
        adminId: requestDoc.adminId || (user?.assignedAdmin ? user.assignedAdmin.toString() : (admin?._id?.toString() || ''))
      });

      await newId.save();

      // Delete the ID request after successful approval to avoid duplication
      await IdRequest.findByIdAndDelete(requestId);
    } else if (status === 'Rejected') {
      await IdRequest.findByIdAndDelete(requestId);
      console.log(`ID request ${requestId} rejected. No balance was deducted.`);
    }

    res.status(200).json({
      message: `ID request ${status.toLowerCase()} successfully`,
      requestId: requestId,
      status: status,
      processedAt: processedAt
    });
  } catch (error) {
    console.error('Error updating ID request status:', error);
    res.status(500).json({ message: 'Error updating ID request status', error: error.message });
  }
};

exports.getAllPendingRequests = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    const allRequests = [];
    let txnScope = {};
    let closeScope = { status: 'Pending' };
    let pwdScope = { status: 'Pending' };

    if (admin?.role === 'superadmin') {
      const filterAdminId = req.query.filterAdminId || req.headers['x-filter-admin-id'];
      if (filterAdminId && filterAdminId !== 'all') {
        const allowedIdentifiers = await getAdminUserIdentifiers(filterAdminId);
        txnScope = {
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: allowedIdentifiers } }
          ]
        };
        closeScope = {
          status: 'Pending',
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: allowedIdentifiers } }
          ]
        };
        pwdScope = {
          status: 'Pending',
          $or: [
            { adminId: filterAdminId },
            { createdBy: { $in: allowedIdentifiers } }
          ]
        };
      }
    } else if (admin) {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      txnScope = {
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: allowedIdentifiers } }
        ]
      };
      closeScope = {
        status: 'Pending',
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: allowedIdentifiers } }
        ]
      };
      pwdScope = {
        status: 'Pending',
        $or: [
          { adminId: admin._id.toString() },
          { createdBy: { $in: allowedIdentifiers } }
        ]
      };
    }

    // Get deposit requests
    const depositTransactions = await Transaction.find({
      status: 'Pending',
      transactionType: 'deposit',
      ...txnScope
    });

    depositTransactions.forEach(doc => {
      const data = doc.toObject();
      allRequests.push({
        ...data,
        id: doc._id,
        transactionDocumentId: doc._id,
        idDocumentId: data.idDocumentId,
        requestType: 'deposit'
      });
    });

    // Get withdrawal requests
    const withdrawalTransactions = await Transaction.find({
      status: 'Pending',
      transactionType: { $in: ['withdrawal', 'wallet_withdrawal'] },
      ...txnScope
    });

    withdrawalTransactions.forEach(doc => {
      const data = doc.toObject();
      allRequests.push({
        ...data,
        id: doc._id,
        transactionDocumentId: doc._id,
        idDocumentId: data.idDocumentId,
        requestType: 'withdrawal'
      });
    });

    // Get close ID requests
    const closeRequests = await CloseRequest.find(closeScope);

    closeRequests.forEach(doc => {
      allRequests.push({
        id: doc._id,
        ...doc.toObject(),
        requestType: 'close_id'
      });
    });

    // Get password change requests
    const passwordRequests = await PasswordChangeRequest.find(pwdScope);

    passwordRequests.forEach(doc => {
      allRequests.push({
        id: doc._id,
        ...doc.toObject(),
        requestType: 'password_change'
      });
    });

    // Sort by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Approve deposit request
exports.approveDepositRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'deposit',
        status: 'Pending'
      });

      if (!transaction) {
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'deposit',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = transaction.adminId === admin._id.toString() || allowedIdentifiers.includes(transaction.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Transaction does not belong to your assigned users.' });
      }
    }

    if (transaction.transactionType !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    transaction.status = 'Accepted';
    transaction.acceptedAt = new Date().toISOString();
    transaction.processedBy = admin?.username || req.user?.id || 'admin';
    await transaction.save();

    let user;
    if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
      user = await User.findById(transaction.createdBy);
    } else {
      user = await User.findOne({ username: transaction.createdBy });
    }

    if (user) {
      const currentBalance = user.balance || 0;
      const amountToDeduct = transaction.amount;

      if (currentBalance < amountToDeduct) {
        return res.status(400).json({
          message: 'User has insufficient balance for this deposit request.',
          currentBalance: currentBalance,
          requiredAmount: amountToDeduct
        });
      }

      const newBalance = currentBalance - amountToDeduct;
      user.balance = newBalance;
      await user.save();

      console.log(`Deducted ₹${amountToDeduct} from user ${user.username}. Old balance: ₹${currentBalance}, New balance: ₹${newBalance}`);
    } else {
      return res.status(404).json({ message: 'User not found for balance deduction.' });
    }

    // Update ID balance
    if (transaction.idDocumentId) {
      const idDoc = await WebsiteId.findById(transaction.idDocumentId);

      if (idDoc) {
        const currentBalance = parseFloat(idDoc.balance) || 0;
        const coinsToAdd = parseFloat(transaction.coinsToReceive) || 0;

        const newIdBalance = currentBalance + coinsToAdd;

        if (isNaN(newIdBalance)) {
          throw new Error(`Invalid balance calculation: currentBalance=${currentBalance}, coinsToAdd=${coinsToAdd}`);
        }

        idDoc.balance = newIdBalance;
        await idDoc.save();
      }
    }

    res.status(200).json({
      message: 'Deposit request approved successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error approving deposit request:', error);
    res.status(500).json({ message: 'Error approving deposit request', error: error.message });
  }
};

// Reject deposit request
exports.rejectDepositRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: 'deposit',
        status: 'Pending'
      });

      if (!transaction) {
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: 'deposit',
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = transaction.adminId === admin._id.toString() || allowedIdentifiers.includes(transaction.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Transaction does not belong to your assigned users.' });
      }
    }

    if (transaction.transactionType !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    transaction.status = 'Rejected';
    transaction.rejectedAt = new Date().toISOString();
    transaction.processedBy = admin?.username || req.user?.id || 'admin';
    await transaction.save();

    res.status(200).json({
      message: 'Deposit request rejected successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error rejecting deposit request:', error);
    res.status(500).json({ message: 'Error rejecting deposit request', error: error.message });
  }
};

// Approve withdrawal request
exports.approveWithdrawalRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: { $in: ['withdrawal', 'wallet_withdrawal'] },
        status: 'Pending'
      });

      if (!transaction) {
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: { $in: ['withdrawal', 'wallet_withdrawal'] },
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = transaction.adminId === admin._id.toString() || allowedIdentifiers.includes(transaction.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Transaction does not belong to your assigned users.' });
      }
    }

    // Update ID balance if it's an ID withdrawal
    if (transaction.idDocumentId) {
      const idDoc = await WebsiteId.findById(transaction.idDocumentId);

      if (idDoc) {
        const currentBalance = parseFloat(idDoc.balance) || 0;
        const coinsToDeduct = parseFloat(transaction.coinsToDeduct) || parseFloat(transaction.coinsNeeded) || parseFloat(transaction.amount) || 0;

        if (currentBalance < coinsToDeduct) {
          transaction.status = 'Insufficient Balance';
          transaction.processedBy = admin?.username || req.user?.id || 'admin';
          transaction.processedAt = new Date().toISOString();
          await transaction.save();

          return res.status(400).json({
            message: 'Insufficient balance',
            error: `Required: ${coinsToDeduct} coins, Available: ${currentBalance} coins`
          });
        }

        const newIdBalance = currentBalance - coinsToDeduct;
        idDoc.balance = newIdBalance;
        await idDoc.save();
      }
    }

    transaction.status = 'Accepted';
    transaction.acceptedAt = new Date().toISOString();
    transaction.processedBy = admin?.username || req.user?.id || 'admin';
    await transaction.save();

    res.status(200).json({
      message: 'Withdrawal request approved successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error approving withdrawal request:', error);
    res.status(500).json({ message: 'Error approving withdrawal request', error: error.message });
  }
};

// Reject withdrawal request
exports.rejectWithdrawalRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageTransactions === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage transactions.' });
    }

    const { requestId } = req.params;

    let transaction = await Transaction.findById(requestId);

    if (!transaction) {
      transaction = await Transaction.findOne({
        idDocumentId: requestId,
        transactionType: { $in: ['withdrawal', 'wallet_withdrawal'] },
        status: 'Pending'
      });

      if (!transaction) {
        transaction = await Transaction.findOne({
          transactionId: requestId,
          transactionType: { $in: ['withdrawal', 'wallet_withdrawal'] },
          status: 'Pending'
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = transaction.adminId === admin._id.toString() || allowedIdentifiers.includes(transaction.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Transaction does not belong to your assigned users.' });
      }
    }

    transaction.status = 'Rejected';
    transaction.rejectedAt = new Date().toISOString();
    transaction.processedBy = admin?.username || req.user?.id || 'admin';
    await transaction.save();

    // Refund if wallet_withdrawal
    if (transaction.transactionType === 'wallet_withdrawal') {
      let user;
      if (mongoose.Types.ObjectId.isValid(transaction.createdBy)) {
        user = await User.findById(transaction.createdBy);
      } else {
        user = await User.findOne({ username: transaction.createdBy });
      }

      if (user) {
        user.balance = (user.balance || 0) + transaction.amount;
        await user.save();
      }
    }

    res.status(200).json({
      message: 'Withdrawal request rejected successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error rejecting withdrawal request:', error);
    res.status(500).json({ message: 'Error rejecting withdrawal request', error: error.message });
  }
};

// Approve close ID request
exports.approveCloseIdRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    const { requestId } = req.params;

    const closeRequest = await CloseRequest.findById(requestId);

    if (!closeRequest) {
      return res.status(404).json({ message: 'Close request not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = closeRequest.adminId === admin._id.toString() || allowedIdentifiers.includes(closeRequest.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Request does not belong to your assigned users.' });
      }
    }

    closeRequest.status = 'Accepted';
    closeRequest.processedAt = new Date().toISOString();
    closeRequest.processedBy = admin?.username || req.user?.id || 'admin';
    await closeRequest.save();

    const idDoc = await WebsiteId.findById(closeRequest.originalId);

    if (idDoc) {
      idDoc.status = 'Closed';
      await idDoc.save();

      const closedId = new ClosedId({
        ...idDoc.toObject(),
        originalId: closeRequest.originalId,
        closedAt: new Date().toISOString(),
        closedBy: admin?.username || req.user?.id || 'admin',
        closeRequestId: requestId,
        adminId: closeRequest.adminId || idDoc.adminId || (admin?._id?.toString() || '')
      });

      await closedId.save();
      await WebsiteId.findByIdAndDelete(closeRequest.originalId);
    }

    res.status(200).json({
      message: 'Close ID request approved successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error approving close ID request:', error);
    res.status(500).json({ message: 'Error approving close ID request', error: error.message });
  }
};

// Reject close ID request
exports.rejectCloseIdRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    const { requestId } = req.params;

    const closeRequest = await CloseRequest.findById(requestId);

    if (!closeRequest) {
      return res.status(404).json({ message: 'Close request not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = closeRequest.adminId === admin._id.toString() || allowedIdentifiers.includes(closeRequest.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Request does not belong to your assigned users.' });
      }
    }

    closeRequest.status = 'Rejected';
    closeRequest.processedAt = new Date().toISOString();
    closeRequest.processedBy = admin?.username || req.user?.id || 'admin';
    await closeRequest.save();

    res.status(200).json({
      message: 'Close ID request rejected successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error rejecting close ID request:', error);
    res.status(500).json({ message: 'Error rejecting close ID request', error: error.message });
  }
};

// Approve password change request
exports.approvePasswordChangeRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    const { requestId } = req.params;

    const passwordRequest = await PasswordChangeRequest.findById(requestId);

    if (!passwordRequest) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = passwordRequest.adminId === admin._id.toString() || allowedIdentifiers.includes(passwordRequest.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Request does not belong to your assigned users.' });
      }
    }

    passwordRequest.status = 'Accepted';
    passwordRequest.processedAt = new Date().toISOString();
    passwordRequest.processedBy = admin?.username || req.user?.id || 'admin';
    await passwordRequest.save();

    const idDoc = await WebsiteId.findById(passwordRequest.idDocumentId);

    if (idDoc && passwordRequest.newPassword) {
      idDoc.password = passwordRequest.newPassword;
      await idDoc.save();
    }

    res.status(200).json({
      message: 'Password change request approved successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error approving password change request:', error);
    res.status(500).json({ message: 'Error approving password change request', error: error.message });
  }
};

// Reject password change request
exports.rejectPasswordChangeRequest = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageIdRequests === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage ID requests.' });
    }

    const { requestId } = req.params;

    const passwordRequest = await PasswordChangeRequest.findById(requestId);

    if (!passwordRequest) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (admin && admin.role !== 'superadmin') {
      const allowedIdentifiers = await getAdminUserIdentifiers(admin._id);
      const isOwner = passwordRequest.adminId === admin._id.toString() || allowedIdentifiers.includes(passwordRequest.createdBy);
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized: Request does not belong to your assigned users.' });
      }
    }

    passwordRequest.status = 'Rejected';
    passwordRequest.processedAt = new Date().toISOString();
    passwordRequest.processedBy = admin?.username || req.user?.id || 'admin';
    await passwordRequest.save();

    res.status(200).json({
      message: 'Password change request rejected successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error rejecting password change request:', error);
    res.status(500).json({ message: 'Error rejecting password change request', error: error.message });
  }
};


// ===== HOME BANNER CAROUSEL =====

// GET all home banner images
exports.getHomeBannerImages = async (req, res) => {
  try {
    const images = await Carousel.find({ type: 'homeBanner' }).sort({ createdAt: -1 });
    const formatted = images.map(img => ({
      id: img._id,
      imagePath: img.imagePath,
      createdAt: img.createdAt,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching home banner images:', error.message);
    res.status(500).json({ message: 'Error fetching home banner images', error: error.message });
  }
};

// POST upload a new home banner image
exports.addHomeBannerImage = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageBanners === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage banners.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const newImage = new Carousel({
      imagePath: req.file.path,
      type: 'homeBanner',
    });
    await newImage.save();
    res.status(201).json({
      message: 'Home banner image uploaded successfully',
      image: {
        id: newImage._id,
        imagePath: newImage.imagePath,
        createdAt: newImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading home banner image:', error.message);
    res.status(500).json({ message: 'Error uploading home banner image', error: error.message });
  }
};

// DELETE a home banner image (removes from MongoDB + Cloudinary)
exports.deleteHomeBannerImage = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageBanners === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage banners.' });
    }

    const image = await Carousel.findById(id);
    if (!image || image.type !== 'homeBanner') {
      return res.status(404).json({ message: 'Home banner image not found' });
    }
    // Extract Cloudinary public_id from the URL
    const urlParts = image.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }
    await Carousel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Home banner image deleted successfully' });
  } catch (error) {
    console.error('Error deleting home banner image:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting home banner image', error: error.message });
  }
};

// --- SQUARE BANNER CAROUSEL ---

exports.getSquareBannerImages = async (req, res) => {
  try {
    const images = await Carousel.find({ type: 'squareBanner' }).sort({ createdAt: -1 });
    const formatted = images.map(img => ({
      id: img._id,
      imagePath: img.imagePath,
      createdAt: img.createdAt,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching square banner images:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching square banner images', error: error.message });
  }
};

exports.addSquareBannerImage = async (req, res) => {
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageBanners === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage banners.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const newImage = new Carousel({
      imagePath: req.file.path,
      type: 'squareBanner',
    });
    await newImage.save();
    res.status(201).json({
      message: 'Square banner image uploaded successfully',
      image: {
        id: newImage._id,
        imagePath: newImage.imagePath,
        createdAt: newImage.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading square banner image:', error.message, error.stack);
    res.status(500).json({ message: 'Error uploading square banner image', error: error.message });
  }
};

exports.deleteSquareBannerImage = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await getAdminFromReq(req);
    if (admin && admin.role !== 'superadmin' && admin.permissions?.canManageBanners === false) {
      return res.status(403).json({ message: 'Permission denied: Cannot manage banners.' });
    }

    const image = await Carousel.findById(id);
    if (!image || image.type !== 'squareBanner') {
      return res.status(404).json({ message: 'Square banner image not found' });
    }
    // Cloudinary cleanup
    const urlParts = image.imagePath.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filtered = afterUpload[0]?.match(/^v\d+$/) ? afterUpload.slice(1) : afterUpload;
      const publicIdWithExt = filtered.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }
    await Carousel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Square banner image deleted successfully' });
  } catch (error) {
    console.error('Error deleting square banner image:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting square banner image', error: error.message });
  }
};

// Get unified accounts list overview (Admins, Sub-Admins, Users, and Betting Account IDs)
exports.getAllAccountsList = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const websiteIds = await WebsiteId.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      summary: {
        totalAdmins: admins.length,
        totalUsers: users.length,
        totalBettingIds: websiteIds.length,
      },
      admins,
      users,
      websiteIds,
    });
  } catch (error) {
    console.error('Error fetching all accounts list:', error);
    res.status(500).json({ message: 'Error retrieving accounts list', error: error.message });
  }
};


