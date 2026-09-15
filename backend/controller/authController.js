const Admin = require('../models/Admin');
const User = require('../models/User');

// loginController.js
exports.loginController = async (req, res) => {
  try {
    // Extract data from the request body
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check in the admin collection first
    const admin = await Admin.findOne({ username });

    if (admin) {
      // Admin found, check the password
      if (admin.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Structure the admin object to match the user structure
      const adminObj = admin.toObject();
      delete adminObj.password;

      const adminWithId = {
        id: admin._id,
        ...adminObj,
        role: admin.role || 'admin', // Preserve superadmin or admin
        permissions: admin.permissions || {},
      };

      return res.status(200).json({
        message: `${admin.role === 'superadmin' ? 'Superadmin' : 'Admin'} login successful`,
        user: adminWithId,
      });
    }
    // If not found in the admin collection, check in the user collection
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User found, check the password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Log the user object before returning
    // console.log('User found:', user);

    // Combine user data with the id and exclude the password
    const userWithId = { id: user._id, ...user.toObject() };
    delete userWithId.password;

    return res.status(200).json({
      message: 'User login successful',
      user: userWithId, // Exclude password
    });

  } catch (error) {
    console.error("Error in loginController:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
