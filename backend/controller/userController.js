const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const Transaction = require('../models/Transaction');
const Website = require('../models/Website');
const WebsiteId = require('../models/WebsiteId');
const IdRequest = require('../models/IdRequest');
const CloseRequest = require('../models/CloseRequest');
const ClosedId = require('../models/ClosedId');
const PasswordChangeRequest = require('../models/PasswordChangeRequest');
const AdminAccount = require('../models/AdminAccount');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const getUserAdminId = async (userIdentifier) => {
  if (!userIdentifier) return '';
  try {
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
      user = await User.findById(userIdentifier);
    }
    if (!user) {
      user = await User.findOne({ username: userIdentifier });
    }
    return user?.assignedAdmin ? user.assignedAdmin.toString() : '';
  } catch (e) {
    return '';
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      ...user.toObject(),
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({
      message: 'Error retrieving user',
      error: error.message || 'Unknown error occurred',
    });
  }
};


// Fetch all users
// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const formattedUsers = users.map(user => ({
      id: user._id,
      ...user.toObject(),
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

// Add a new user (Signup) - Restricted to admin creation
exports.addUser = async (req, res) => {
  return res.status(403).json({
    message: 'Public registration is restricted. Please contact an administrator to create your account.'
  });
};


// Get Account Details
// Get Account Details
exports.getAccountDetails = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userAccount = await UserAccount.findOne({ userId });

    if (!userAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    return res.status(200).json(userAccount);

  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateAccountDetails = async (req, res) => {
  const { userId, accountNumber, accountHolderName, ifscCode, bankName, upiId } = req.body;

  if (!userId || typeof userId === "undefined" || userId.toString().trim() === "") {
    return res.status(400).json({ message: "Invalid userId. It must be a non-empty string or number." });
  }

  try {
    const defaultData = {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      upiId: "",
    };

    const updatedData = {
      accountNumber: accountNumber || defaultData.accountNumber,
      accountHolderName: accountHolderName || defaultData.accountHolderName,
      ifscCode: ifscCode || defaultData.ifscCode,
      bankName: bankName || defaultData.bankName,
      upiId: upiId || defaultData.upiId,
    };

    let userAccount = await UserAccount.findOne({ userId });

    if (userAccount) {
      Object.assign(userAccount, updatedData);
      await userAccount.save();
      return res.status(200).json({
        message: "Account details updated successfully",
        updatedAccount: { userId, ...updatedData },
      });
    } else {
      userAccount = new UserAccount({ userId, ...updatedData });
      await userAccount.save();
      return res.status(201).json({
        message: "Account details created successfully",
        newAccount: { userId, ...updatedData },
      });
    }
  } catch (error) {
    console.error("Error upserting account details:", error);
    res.status(500).json({ message: "Error handling account details", error: error.message });
  }
};


exports.updateProfileController = async (req, res) => {
  const { userId, name, phoneNumber, email, password } = req.body;

  if (!userId || !name || !phoneNumber || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (password && password.trim() !== '') user.password = password;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      updatedUser: {
        userId,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: user.password,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.createTransaction = async (req, res) => {
  const { amount, createdAt, createdBy, paymentMethod } = req.body;
  const imageFile = req.file; // The uploaded file will be available in req.file

  // console.log('Form Data:', req.body);
  // console.log('Uploaded File:', imageFile);

  // Validation: Ensure required fields are provided
  if (!amount || !createdAt || !createdBy || !imageFile) {
    return res.status(400).json({ message: 'Amount, createdAt, createdBy, and image are required.' });
  }

  try {
    // Generate a unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const adminId = await getUserAdminId(createdBy);
    // Prepare the transaction data
    const transactionData = {
      description: "Payment For Deposite",
      transactionId,
      paymentMethod: paymentMethod, // Payment method
      createdAt,
      acceptedAt: "Not updated",   // Default value
      status: "Pending",           // Default status
      amount,
      createdBy,
      adminId,
      imagePath: imageFile.path,   // Store the path to the uploaded file
    };

    // Save transaction data to Firestore (or your DB of choice)
    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Send a successful response with the transaction data
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction._id,
        ...transaction.toObject(),
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.createTransactionById = async (req, res) => {
  const {
    amount,
    createdAt,
    createdBy,
    websiteName,
    websiteUrl,
    username,
    status,
    createdAtSelectedId,
    id,
  } = req.body;

  if (!amount || !createdAt || !createdBy || !websiteName || !id) {
    return res.status(400).json({
      message: "Amount, createdAt, createdBy, websiteName, and ID are required.",
    });
  }

  try {
    const transactionId = `txn_${Date.now()}`;
    const adminId = await getUserAdminId(createdBy);

    const transactionData = {
      description: `Payment For Deposit - ${websiteName} (${username})`,
      transactionId,
      paymentMethod: "Withdraw From Wallet",
      createdAt,
      acceptedAt: "Not updated",
      status: "Pending",
      amount,
      createdBy: createdBy,
      adminId,
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction._id,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};


exports.createWithdrawalTransactionBy = async (req, res) => {
  try {
    const {
      amount,
      coinsNeeded,
      coinRate,
      withdrawalMethod,
      withdrawalDetails,
      createdAt,
      createdBy,
      websiteName,
      websiteUrl,
      username,
      status,
      id
    } = req.body;

    console.log('Received withdrawal data:', req.body);

    if (!amount || !createdAt || !createdBy || !websiteName || !websiteUrl || !username || !status || !id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let parsedWithdrawalDetails = withdrawalDetails;
    if (typeof withdrawalDetails === 'string') {
      try {
        parsedWithdrawalDetails = JSON.parse(withdrawalDetails);
      } catch (e) {
        console.error('Error parsing withdrawal details:', e);
        parsedWithdrawalDetails = {};
      }
    }

    const transactionId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const adminId = await getUserAdminId(createdBy);

    const transactionData = {
      description: `Withdrawal Request - ${websiteName} (${username}) - ₹${amount} (${coinsNeeded} coins)`,
      transactionId,
      paymentMethod: withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer',
      createdAt,
      acceptedAt: 'Not updated',
      status: 'Pending',
      amount: parseFloat(amount),
      coinsNeeded: parseInt(coinsNeeded),
      coinRate: parseFloat(coinRate),
      withdrawalMethod,
      withdrawalDetails: parsedWithdrawalDetails,
      websiteName,
      websiteUrl,
      username,
      idDocumentId: id,
      createdBy,
      adminId,
      imagePath: 'No path',
      transactionType: 'withdrawal'
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    console.log('Withdrawal transaction created:', transaction._id);

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      transactionId: transaction._id,
      coinsNeeded: coinsNeeded,
      amount: amount
    });
  } catch (error) {
    console.error('Error creating withdrawal transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Create wallet withdrawal request
exports.createWalletWithdrawal = async (req, res) => {
  try {
    const {
      amount,
      withdrawalMethod,
      withdrawalDetails,
      createdAt,
      createdBy
    } = req.body;

    console.log('Received wallet withdrawal data:', req.body);

    if (!amount || !withdrawalMethod || !createdAt || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ username: createdBy }); // Assuming createdBy is username

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentBalance = user.balance || 0;
    const withdrawalAmount = parseFloat(amount);

    if (currentBalance < withdrawalAmount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
        currentBalance: currentBalance,
        requestedAmount: withdrawalAmount,
        shortfall: withdrawalAmount - currentBalance
      });
    }

    const transactionId = `wallet_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const adminId = user.assignedAdmin ? user.assignedAdmin.toString() : '';

    const transactionData = {
      description: `Wallet Withdrawal Request - ₹${amount} via ${withdrawalMethod === 'upi' ? 'UPI' : 'Bank Transfer'}`,
      transactionId,
      paymentMethod: withdrawalMethod === 'upi' ? 'UPI Withdrawal' : 'Bank Transfer Withdrawal',
      createdAt,
      acceptedAt: 'Not updated',
      status: 'Pending',
      amount: withdrawalAmount,
      withdrawalMethod,
      withdrawalDetails: withdrawalDetails,
      createdBy,
      adminId,
      imagePath: 'No path',
      transactionType: 'wallet_withdrawal'
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    console.log('Wallet withdrawal transaction created:', transaction._id);

    res.status(201).json({
      message: 'Wallet withdrawal request created successfully',
      transactionId: transaction._id,
      amount: withdrawalAmount
    });
  } catch (error) {
    console.error('Error creating wallet withdrawal transaction:', error);
    res.status(500).json({ message: 'Error creating withdrawal request', error: error.message });
  }
};

exports.createId = async (req, res) => {
  const { websiteName, websiteUrl, username, imgUrl, createdBy } = req.body;

  if (!websiteName || !websiteUrl || !username || !imgUrl || !createdBy) {
    return res.status(400).json({ message: 'All required fields are provided.' });
  }

  try {
    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userBalance = user.balance || 0;

    if (userBalance < 100) {
      return res.status(400).json({
        message: 'Insufficient balance. Minimum balance of ₹100 required to create ID.',
        currentBalance: userBalance,
        requiredBalance: 100
      });
    }

    let coinRate = 1;
    let minimumCoins = 0;

    try {
      const website = await Website.findOne({ website: websiteName });

      if (website) {
        coinRate = parseFloat(website.coinRate) || 1;
        minimumCoins = parseFloat(website.minimumCoins) || 0;
      }
    } catch (error) {
      console.error('Error fetching website details:', error);
    }

    const createdAt = new Date();
    const adminId = user.assignedAdmin ? user.assignedAdmin.toString() : '';

    const newWebsite = new WebsiteId({
      websiteName,
      websiteUrl,
      username,
      password: '',
      imgUrl,
      createdBy,
      status: 'Requested',
      balance: 0,
      coinRate,
      minimumCoins,
      createdAt: createdAt.toISOString(),
      adminId,
    });

    await newWebsite.save();

    res.status(201).json({
      message: 'New ID created successfully',
      website: { id: newWebsite._id, ...newWebsite.toObject() },
    });
  } catch (error) {
    console.error('Error adding ID:', error);
    res.status(500).json({ message: 'Error adding ID', error: error.message });
  }
};
const buildWebsiteAdminMap = (websites) => {
  const websiteMap = {};
  websites.forEach(w => {
    const admin = (w.adminUrl || '').trim();
    if (!admin) return;
    if (w.website) {
      websiteMap[w.website.toLowerCase().trim()] = admin;
    }
    if (w.url) {
      const cleanUrl = w.url.toLowerCase().trim();
      websiteMap[cleanUrl] = admin;
      websiteMap[cleanUrl.replace(/\/+$/, '')] = admin;
      try {
        const parsed = new URL(cleanUrl);
        websiteMap[parsed.hostname.replace(/^www\./, '')] = admin;
      } catch (e) {}
    }
  });
  return websiteMap;
};

const resolveAdminUrl = (item, websiteMap) => {
  if (item.adminUrl && item.adminUrl.trim()) return item.adminUrl.trim();
  const nameKey = (item.websiteName || item.website || '').toLowerCase().trim();
  const urlKey = (item.websiteUrl || item.url || '').toLowerCase().trim();
  const cleanUrlKey = urlKey.replace(/\/+$/, '');

  if (nameKey && websiteMap[nameKey]) return websiteMap[nameKey];
  if (urlKey && websiteMap[urlKey]) return websiteMap[urlKey];
  if (cleanUrlKey && websiteMap[cleanUrlKey]) return websiteMap[cleanUrlKey];

  try {
    if (urlKey.startsWith('http')) {
      const parsed = new URL(urlKey);
      const host = parsed.hostname.replace(/^www\./, '');
      if (websiteMap[host]) return websiteMap[host];
    }
  } catch (e) {}

  for (const [k, v] of Object.entries(websiteMap)) {
    if (v && nameKey && (k.includes(nameKey) || nameKey.includes(k))) {
      return v;
    }
  }
  return '';
};

exports.getAllIds = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch active IDs
    const activeIds = await WebsiteId.find({ createdBy: userId });

    // Fetch closed IDs
    const closedIds = await ClosedId.find({ createdBy: userId });

    // Fetch websites to resolve adminUrl
    const websites = await Website.find();
    const websiteMap = buildWebsiteAdminMap(websites);

    // Combine both active and closed IDs
    const allIds = [
      ...activeIds.map((doc) => {
        const obj = doc.toObject();
        return {
          id: doc._id,
          ...obj,
          adminUrl: resolveAdminUrl(obj, websiteMap),
          type: 'active'
        };
      }),
      ...closedIds.map((doc) => {
        const obj = doc.toObject();
        return {
          id: doc._id,
          ...obj,
          adminUrl: resolveAdminUrl(obj, websiteMap),
          status: 'Closed',
          type: 'closed'
        };
      })
    ];

    if (allIds.length === 0) {
      return res.status(404).json({ message: "No IDs found for this user" });
    }

    res.status(200).json(allIds);
  } catch (error) {
    console.error("Error fetching IDs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create ID Request with coin conversion and refundable options
exports.createIdRequest = async (req, res) => {
  const {
    websiteName,
    websiteUrl,
    adminUrl,
    username,
    imgUrl,
    createdBy,
    coinAmount,
    convertedCoins,
    coinRate,
    minimumCoins,
    refundable,
    accountType,
    currency,
    status
  } = req.body;

  if (!websiteName || !websiteUrl || !username || !imgUrl || !createdBy || !coinAmount || !convertedCoins) {
    return res.status(400).json({ message: 'All required fields are provided.' });
  }

  try {
    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userBalance = user.balance || 0;

    if (userBalance < convertedCoins) {
      return res.status(400).json({
        message: 'Insufficient balance for the requested amount.',
        currentBalance: userBalance,
        requestedAmount: convertedCoins
      });
    }

    if (coinAmount < minimumCoins) {
      return res.status(400).json({
        message: 'Insufficient coins. Minimum required coins not met.',
        coinAmount: coinAmount,
        minimumCoins: minimumCoins
      });
    }

    // Resolve adminUrl if not provided
    let resolvedAdminUrl = adminUrl || '';
    if (!resolvedAdminUrl) {
      const matchedWebsite = await Website.findOne({
        $or: [{ website: websiteName }, { url: websiteUrl }]
      });
      if (matchedWebsite?.adminUrl) {
        resolvedAdminUrl = matchedWebsite.adminUrl;
      }
    }

    const createdAt = new Date();

    const adminId = user.assignedAdmin ? user.assignedAdmin.toString() : '';

    const idRequest = new IdRequest({
      websiteName,
      websiteUrl,
      adminUrl: resolvedAdminUrl,
      username,
      imgUrl,
      createdBy,
      adminId,
      coinAmount: parseFloat(coinAmount),
      convertedCoins: parseFloat(convertedCoins),
      coinRate: parseFloat(coinRate),
      minimumCoins: parseFloat(minimumCoins),
      refundable: Boolean(refundable),
      accountType: accountType || 'admin',
      currency: currency || 'INR',
      status: status || 'Pending',
      createdAt: createdAt.toISOString(),
      processedAt: null,
      processedBy: null,
      adminNotes: null
    });

    await idRequest.save();

    // NOTE: Balance will be deducted when admin accepts the request
    // Do NOT deduct balance here to prevent loss if request is rejected

    const transactionData = {
      description: `ID Creation Request - ${websiteName} (${username}) - ${parseFloat(coinAmount)} coins`,
      transactionId: `id_req_${Date.now()}`,
      paymentMethod: "ID Creation Request",
      createdAt: createdAt.toISOString(),
      acceptedAt: "Not updated",
      status: "Pending", // Transaction is pending admin approval
      amount: parseFloat(convertedCoins), // Store the deducted amount (Rupees)
      createdBy: createdBy,
      adminId,
      idRequestId: idRequest._id.toString(),
      websiteName: websiteName,
      websiteUrl: websiteUrl,
      username: username,
      convertedCoins: parseFloat(convertedCoins),
      coinRate: parseFloat(coinRate),
      refundable: Boolean(refundable),
      accountType: accountType || 'admin',
      currency: currency || 'INR',
      transactionType: 'id_creation_request' // Mark as a request transaction, deduction happens on approval
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    res.status(201).json({
      message: 'ID creation request submitted successfully',
      requestId: idRequest._id,
      transactionId: transaction._id,
      idRequest: idRequest.toObject()
    });
  } catch (error) {
    console.error('Error creating ID request:', error);
    res.status(500).json({ message: 'Error creating ID request', error: error.message });
  }
};



// Close ID - Create close request for admin approval
exports.closeId = async (req, res) => {
  const { id, createdBy, reason } = req.body;

  if (!id || !createdBy) {
    return res.status(400).json({ message: 'ID and createdBy are required.' });
  }

  try {
    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found.' });
    }

    if (idDoc.createdBy !== createdBy) {
      return res.status(403).json({ message: 'You are not authorized to close this ID.' });
    }

    const adminId = idDoc.adminId || await getUserAdminId(createdBy);

    const closeRequest = new CloseRequest({
      originalId: id,
      createdBy,
      adminId,
      reason: reason || 'User requested to close ID',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      websiteName: idDoc.websiteName,
      websiteUrl: idDoc.websiteUrl,
      username: idDoc.username
    });

    await closeRequest.save();

    res.status(201).json({
      message: 'Close ID request submitted successfully',
      request: { id: closeRequest._id, ...closeRequest.toObject() }
    });
  } catch (error) {
    console.error('Error creating close ID request:', error);
    res.status(500).json({ message: 'Error creating close ID request', error: error.message });
  }
};

// Get transactions for specific ID
exports.getIdTransactions = async (req, res) => {
  const { id, userId } = req.query;

  if (!id || !userId) {
    return res.status(400).json({ message: 'ID and userId are required.' });
  }

  try {
    console.log('Getting transactions for ID:', id, 'User:', userId);

    const idDoc = await WebsiteId.findById(id);
    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found.' });
    }

    const websiteName = idDoc.websiteName || '';
    const websiteUrl = idDoc.websiteUrl || '';
    const username = idDoc.username || '';

    console.log('ID Data:', { websiteName, websiteUrl, username, createdBy: idDoc.createdBy });

    // Get all transactions for this user (without ordering to avoid index requirement)
    const transactions = await Transaction.find({ createdBy: userId });

    console.log('Found transactions:', transactions.length);

    // If no transactions found, return empty array instead of error
    if (transactions.length === 0) {
      return res.status(200).json([]);
    }

    // Filter transactions that are related to this specific ID
    const allTransactions = transactions.map(doc => ({
      id: doc._id,
      ...doc.toObject()
    }));

    // Sort by creation date in JavaScript (newest first)
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Filter transactions that are ONLY related to this specific ID
    // Use strict matching on idDocumentId to ensure we only show transactions for THIS ID
    const relatedTransactions = allTransactions.filter(transaction => {
      // Only match transactions that have the exact idDocumentId
      return transaction.idDocumentId === id;
    });

    // Add ID information to each transaction for better context
    const enrichedTransactions = relatedTransactions.map(transaction => ({
      ...transaction,
      relatedId: {
        id: id,
        websiteName: websiteName,
        websiteUrl: websiteUrl,
        username: username
      }
    }));

    res.status(200).json(enrichedTransactions);
  } catch (error) {
    console.error('Error fetching ID transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Request password change for ID
// Request password change for ID
exports.requestPasswordChange = async (req, res) => {
  const { id, createdBy, newPassword, reason } = req.body;

  if (!id || !createdBy || !newPassword) {
    return res.status(400).json({ message: 'ID, createdBy, and newPassword are required.' });
  }

  try {
    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found.' });
    }

    if (idDoc.createdBy !== createdBy) {
      return res.status(403).json({ message: 'You are not authorized to change password for this ID.' });
    }

    const adminId = idDoc.adminId || await getUserAdminId(createdBy);

    const passwordChangeRequest = new PasswordChangeRequest({
      originalId: id,
      createdBy,
      adminId,
      newPassword,
      reason: reason || 'User requested password change',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      websiteName: idDoc.websiteName,
      websiteUrl: idDoc.websiteUrl,
      username: idDoc.username
    });

    await passwordChangeRequest.save();

    res.status(201).json({
      message: 'Password change request submitted successfully',
      request: { id: passwordChangeRequest._id, ...passwordChangeRequest.toObject() }
    });
  } catch (error) {
    console.error('Error requesting password change:', error);
    res.status(500).json({ message: 'Error requesting password change', error: error.message });
  }
};

exports.changeIdPassword = async (req, res) => {

  const { userId, selectedId, newPassword } = req.body;

  if (!userId || !selectedId || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const selectedItemDoc = await WebsiteId.findById(selectedId);

    if (!selectedItemDoc) {
      return res.status(404).json({ message: 'Selected ID not found' });
    }

    if (selectedItemDoc.createdBy != userId) {
      return res.status(403).json({ message: 'Unauthorized to change this password' });
    }

    selectedItemDoc.password = newPassword;
    await selectedItemDoc.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get Account Details (Lookup per assigned admin with fallback)
exports.getAccountDetailsDeposit = async (req, res) => {
  try {
    const userId = req.query.userId;
    let targetAdminId = null;

    if (userId) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      } else {
        user = await User.findOne({ username: userId });
      }

      if (user && user.assignedAdmin) {
        targetAdminId = user.assignedAdmin.toString();
      }
    }

    let userAccount = null;
    if (targetAdminId) {
      userAccount = await AdminAccount.findOne({ userId: targetAdminId });
    }

    if (!userAccount) {
      userAccount = (await AdminAccount.findOne({ userId: "1" })) || (await AdminAccount.findOne());
    }

    if (!userAccount) {
      return res.status(200).json({
        accountNumber: "1234567890",
        accountHolderName: "Admin",
        ifscCode: "ABCD0123456",
        bankName: "XYZ Bank",
        upiId: "sample@upi",
      });
    }

    return res.status(200).json({
      accountNumber: userAccount.accountNumber || '',
      accountHolderName: userAccount.accountHolderName || '',
      ifscCode: userAccount.ifscCode || '',
      bankName: userAccount.bankName || '',
      upiId: userAccount.upiId || '',
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// get the user deposite history

// Controller function to fetch transactions for a user
// Controller function to fetch transactions for a user
exports.getDepositTransactions = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    let userData = null;
    let userDoc = null;

    // Check if userId is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userDoc = await User.findById(userId);
    }

    if (userDoc) {
      userData = userDoc.toObject();
    } else {
      userDoc = await User.findOne({ username: userId });
      if (userDoc) {
        userData = userDoc.toObject();
      }
    }

    const allTransactions = await Transaction.find();

    if (allTransactions.length === 0) {
      return res.status(200).json([]);
    }

    const transactions = allTransactions.filter(transaction => {
      const matches = (
        transaction.createdBy === userId ||
        transaction.createdBy === userData?.username ||
        (userData && transaction.createdBy === userData._id.toString()) ||
        transaction.createdBy === "user"
      );
      return matches;
    });

    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      ...t.toObject()
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};




// Controller to get user balance
// Controller to get user balance
exports.getBalanceController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ username: userId });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const balance = user.balance || 0;

    return res.status(200).json({ balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to get ID balance
// Controller to get ID balance
exports.getIdBalanceController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const idDoc = await WebsiteId.findById(id);

    if (!idDoc) {
      return res.status(404).json({ message: 'ID not found' });
    }

    const balance = idDoc.balance || 0;

    return res.status(200).json({
      id: id,
      balance: balance,
      websiteName: idDoc.websiteName,
      username: idDoc.username
    });
  } catch (error) {
    console.error('Error fetching ID balance:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


// Get user's ID requests
// Get user's ID requests
exports.getUserIdRequests = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userRequests = await IdRequest.find({ createdBy: userId });

    if (userRequests.length === 0) {
      return res.status(200).json([]);
    }

    const websites = await Website.find();
    const websiteMap = buildWebsiteAdminMap(websites);

    const formattedRequests = userRequests.map((doc) => {
      const obj = doc.toObject();
      return {
        id: doc._id,
        ...obj,
        adminUrl: resolveAdminUrl(obj, websiteMap)
      };
    });

    formattedRequests.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Error fetching user ID requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// API to add coin rates to websites that are missing them
// API to add coin rates to websites that are missing them
exports.addCoinRatesToWebsites = async (req, res) => {
  try {
    console.log('Adding coin rates to websites that are missing them...');

    const websites = await Website.find();

    console.log('Found websites:', websites.length);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const website of websites) {
      if (website.coinRate !== undefined && website.minimumCoins !== undefined) {
        console.log(`Skipping website ${website._id} - already has coin rate:`, website.coinRate);
        skippedCount++;
        continue;
      }

      let coinRate = 1.0;
      let minimumCoins = 0;

      if (website.website === 'qweqweqqwe') {
        coinRate = 0.25;
        minimumCoins = 12000;
      } else if (website.website === 'asd') {
        coinRate = 2.0;
        minimumCoins = 100;
      } else if (website.website === 'jhgjh') {
        coinRate = 1.5;
        minimumCoins = 200;
      } else if (website.website === 'sdf') {
        coinRate = 0.5;
        minimumCoins = 500;
      }

      website.coinRate = coinRate;
      website.minimumCoins = minimumCoins;
      await website.save();

      console.log(`Updated website ${website._id} (${website.website}) with coin rate:`, coinRate, 'minimum coins:', minimumCoins);
      updatedCount++;
    }

    res.status(200).json({
      message: 'Coin rates added to websites successfully',
      totalWebsites: websites.length,
      updated: updatedCount,
      skipped: skippedCount
    });

  } catch (error) {
    console.error('Error adding coin rates to websites:', error);
    res.status(500).json({
      message: 'Failed to add coin rates to websites',
      error: error.message
    });
  }
};

// New deposit API with coin conversion and validation
// New deposit API with coin conversion and validation
exports.createNewDepositTransaction = async (req, res) => {
  try {
    const {
      amount,
      coinsToReceive,
      coinRate,
      refundable,
      websiteName,
      websiteUrl,
      username,
      id,
      createdBy,
      createdAt,
      status
    } = req.body;

    if (!amount || !coinsToReceive || !coinRate || !websiteName || !username || !id || !createdBy) {
      return res.status(400).json({
        message: 'Missing required fields: amount, coinsToReceive, coinRate, websiteName, username, id, createdBy'
      });
    }

    console.log('Looking for user with ID:', createdBy);
    let user = null;
    if (mongoose.Types.ObjectId.isValid(createdBy)) {
      user = await User.findById(createdBy);
    } else {
      user = await User.findOne({ username: createdBy });
    }

    if (!user) {
      console.log('User not found with username either:', createdBy);
      return res.status(404).json({ message: 'User not found' });
    }

    const userBalance = user.balance || 0;

    if (parseFloat(amount) > userBalance) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
        currentBalance: userBalance,
        requiredAmount: parseFloat(amount)
      });
    }

    const transactionId = `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const adminId = user.assignedAdmin ? user.assignedAdmin.toString() : '';

    const transactionData = {
      description: `Deposit Request - ${websiteName} (${username}) - ₹${amount} (${coinsToReceive} coins)`,
      transactionId,
      paymentMethod: 'Deposit',
      createdAt: createdAt || new Date().toISOString(),
      acceptedAt: 'Not updated',
      status: status || 'Pending',
      amount: parseFloat(amount),
      coinsToReceive: parseInt(coinsToReceive),
      coinRate: parseFloat(coinRate),
      refundable: refundable === true || refundable === 'true',
      websiteName,
      websiteUrl,
      username,
      idDocumentId: id,
      createdBy,
      adminId,
      imagePath: 'No image required for deposit',
      transactionType: 'deposit'
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    console.log('New deposit transaction created:', transaction._id);

    res.status(201).json({
      message: 'Deposit request submitted successfully',
      transaction: {
        id: transaction._id,
        ...transactionData,
      },
    });

  } catch (error) {
    console.error('Error creating deposit transaction:', error);
    res.status(500).json({
      message: 'Error creating deposit transaction',
      error: error.message
    });
  }
};

// Migration script to update existing IDs with coin rates
// Migration script to update existing IDs with coin rates
exports.migrateIdsWithCoinRates = async (req, res) => {
  try {
    console.log('Starting migration to add coin rates to existing IDs...');

    const websites = await Website.find();
    console.log('Found websites:', websites.length);

    const websiteMap = {};
    websites.forEach(website => {
      websiteMap[website.website] = {
        coinRate: parseFloat(website.coinRate) || 1,
        minimumCoins: parseFloat(website.minimumCoins) || 0
      };
    });

    console.log('Website map:', websiteMap);

    const ids = await WebsiteId.find();
    console.log('Found IDs:', ids.length);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const idDoc of ids) {
      const websiteName = idDoc.websiteName;

      if (idDoc.coinRate !== undefined) {
        console.log(`Skipping ID ${idDoc._id} - already has coin rate:`, idDoc.coinRate);
        skippedCount++;
        continue;
      }

      const websiteInfo = websiteMap[websiteName];
      if (websiteInfo) {
        idDoc.coinRate = websiteInfo.coinRate;
        idDoc.minimumCoins = websiteInfo.minimumCoins;
        idDoc.balance = idDoc.balance !== undefined ? idDoc.balance : 0;

        await idDoc.save();
        console.log(`Updated ID ${idDoc._id} for website ${websiteName} with coin rate:`, websiteInfo.coinRate);
        updatedCount++;
      } else {
        console.log(`Website not found for ID ${idDoc._id}, website: ${websiteName}`);

        idDoc.coinRate = 1;
        idDoc.minimumCoins = 0;
        idDoc.balance = idDoc.balance !== undefined ? idDoc.balance : 0;

        await idDoc.save();
        console.log(`Updated ID ${idDoc._id} with default coin rate: 1`);
        updatedCount++;
      }
    }

    res.status(200).json({
      message: 'Migration completed successfully',
      totalIds: ids.length,
      updated: updatedCount,
      skipped: skippedCount,
      websiteMap: websiteMap
    });

  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({
      message: 'Migration failed',
      error: error.message
    });
  }
};

// Controller to get a simple Hello message
exports.getHelloController = async (req, res) => {
  try {
    console.log("Request received for Hello endpoint");

    // Respond with a simple message
    res.status(200).json({ message: 'Hello' });
  } catch (error) {
    console.error('Error in getHelloController:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
