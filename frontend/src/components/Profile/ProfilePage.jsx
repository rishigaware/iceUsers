import React, { useState, useEffect, useRef } from "react";
import styles from "./ProfilePage.module.css"; // Using CSS Modules for styling
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TopNavbar from '../Navbar/TopNavbar';
import { useUser } from "../../context/UserContext";
import { useNavigate } from 'react-router-dom';
import LoginPopup from '../Login/LoginPopup';
import { Toast } from "primereact/toast";
import { checkIsAdmin } from "../../utils/roles";
import { formatCurrency } from "../../utils/currency";

const ProfilePage = () => {
  const { user, setUser, url, refreshUserBalance } = useUser();  // Get user and setUser from context
  const navigate = useNavigate(); // For navigation
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const toast = useRef(null); // Add a reference for Toast

  const isAdmin = checkIsAdmin(user);
  const userId = user?.id || user?._id || '';
  const adminHeaderId = user?.id || user?._id || user?.username || '';

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (userId) {
      refreshUserBalance();
    }
  }, [userId, refreshUserBalance]);

  const [profileInfo, setProfileInfo] = useState({
    name: user?.name || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    password: user?.password || '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isPaymentEditing, setIsPaymentEditing] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch user data on component load
  useEffect(() => {
    if (!user) {
      setIsModalOpen(true);
      return;
    }

    const endpoint = isAdmin
      ? `${url}/api/admin/get-accountdetails?userId=${userId}`
      : `${url}/api/user/get-accountdetails?userId=${userId}`;
    const headers = isAdmin ? { 'x-admin-id': adminHeaderId } : {};

    fetch(endpoint, { headers })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error fetching account data');
      })
      .then(data => {
        setPaymentInfo({
          accountNumber: data.accountNumber || '',
          accountHolderName: data.accountHolderName || '',
          ifscCode: data.ifscCode || '',
          bankName: data.bankName || '',
          upiId: data.upiId || '',
        });
      })
      .catch(error => {
        console.error('Error during the request:', error);
      });
  }, [user, isAdmin, userId, adminHeaderId, url]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileEditClick = () => {
    setIsProfileEditing(true);
  };

  const handleProfileCancelClick = () => {
    setIsProfileEditing(false);
    setProfileInfo({
      name: user?.name || '',
      phone: user?.phoneNumber || '',
      email: user?.email || '',
      password: user?.password || '',
    });
  };

  const handlePaymentEditClick = () => {
    setIsPaymentEditing(true);
  };

  const handlePaymentCancelClick = () => {
    setIsPaymentEditing(false);
    setPaymentInfo({
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    });
  };

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsModalOpen(true);
  };

  // Handle save button click for Payment
  const handlePaymentSaveClick = async () => {
    try {
      const endpoint = isAdmin
        ? `${url}/api/admin/update-accountdetails`
        : `${url}/api/user/update-accountdetails`;
      const headers = {
        'Content-Type': 'application/json',
        ...(isAdmin ? { 'x-admin-id': adminHeaderId } : {})
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          accountNumber: paymentInfo.accountNumber,
          accountHolderName: paymentInfo.accountHolderName,
          ifscCode: paymentInfo.ifscCode,
          bankName: paymentInfo.bankName,
          upiId: paymentInfo.upiId,
        }),
      });

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Payment Details Updated',
          detail: 'Payment Details Updated successfully',
          life: 2000,
        });
        setIsPaymentEditing(false);
      } else {
        const errorData = await response.json();
        toast.current.show({
          severity: 'error',
          summary: 'Update Failed',
          detail: errorData.message || 'Failed to update payment details',
          life: 2000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Network error occurred',
        life: 2000,
      });
      console.error('Error during the request:', error);
    }
  };

  const handleProfileSaveClick = async () => {
    const updatedProfile = {
      userId,
      name: profileInfo.name,
      phoneNumber: profileInfo.phone,
      email: profileInfo.email,
      password: profileInfo.password,
    };

    try {
      const endpoint = isAdmin
        ? `${url}/api/admin/update-profile`
        : `${url}/api/user/update-profile`;
      const headers = {
        'Content-Type': 'application/json',
        ...(isAdmin ? { 'x-admin-id': adminHeaderId } : {})
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        toast.current.show({
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Profile Updated Successfully',
          life: 2000,
        });
  
        // Update the user context with the updated information, keeping the userId intact
        setUser((prevUser) => ({
          ...prevUser, // Spread the previous user data
          name: data.updatedUser.name,  // Update the name
          phoneNumber: data.updatedUser.phoneNumber,  // Update the phone number
          email: data.updatedUser.email,  // Update the email
          password: data.updatedUser.password,  // Only update the password if necessary
        }));
  
        // Update localStorage with the updated user information (excluding password)
        // const { password, ...userWithoutPassword } = data.updatedUser; // Exclude password from localStorage
        localStorage.setItem('user', JSON.stringify(user));
  
        // Disable editing mode
        setIsProfileEditing(false);
      } else {
        // Handle errors from the server
        const errorData = await response.json();
        toast.current.show({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Failed to update profile',
          life: 2000,
        });
        console.error('Error updating profile:', errorData.message);
      }
    } catch (error) {
      // Handle any network or request errors
      toast.current.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Network error occurred',
        life: 2000,
      });
      console.error('Error during the request:', error);
    }
  };

  // Handle cancel for profile editing
  const handleProfileCancel = () => {
    setProfileInfo({
      name: user?.name || '',
      phone: user?.phoneNumber || '',
      email: user?.email || '',
      password: user?.password || '',
    });
    setIsProfileEditing(false);
  };

  // Handle cancel for payment editing
  const handlePaymentCancel = () => {
    setPaymentInfo({
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    });
    setIsPaymentEditing(false);
  };
  
  return (
    <div className={styles.profilePage}>
      <TopNavbar />
      <Toast ref={toast} />

      <div className={styles.container}>
        
        {/* Page Heading */}
        <h2 className={styles.heading}>
          <strong>Profile Management</strong>
        </h2>
        
        {/* Enhanced Wallet Balance Card */}
        <div className={styles.balanceCard}>
          {!isAdmin && (
            <>
              <div className={styles.balanceIcon}>
                <WalletIcon sx={{ fontSize: 40, color: '#ffffff' }} />
              </div>
              <div className={styles.balanceContent}>
                <div className={styles.balanceAmount}>
                  <span className={styles.currency}></span>
                  <span className={styles.amount}>{formatCurrency(user?.balance)}</span>
                </div>
                <p className={styles.balanceLabel}>Wallet Balance</p>
              </div>
            </>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogoutIcon sx={{ fontSize: 20 }} />
            <span>Logout</span>
          </button>
        </div>

        {/* Enhanced Profile Information Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <AccountCircleIcon sx={{ fontSize: 40, color: 'var(--primary-color)' }} />
            </div>
            <h2 className={styles.cardTitle}>Profile Information</h2>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Name</label>
              <div className={styles.infoValue}>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileInfo.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter your name"
                  />
                ) : (
                  <span className={styles.infoText}>{profileInfo.name}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Phone Number</label>
              <div className={styles.infoValue}>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileInfo.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <span className={styles.infoText}>{profileInfo.phone}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Email</label>
              <div className={styles.infoValue}>
                <span className={styles.infoText}>{profileInfo.email}</span>
              </div>
            </div>

            {isProfileEditing && (
              <div className={styles.infoRow}>
                <label className={styles.infoLabel}>New Password</label>
                <div className={styles.infoValue}>
                  <input
                    type="password"
                    value={profileInfo.password}
                    onChange={(e) => handleProfileChange('password', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter new password"
                  />
                  <p style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)', 
                    marginTop: '5px', 
                    fontStyle: 'italic' 
                  }}>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.cardActions}>
            {isProfileEditing ? (
              <>
                <button className={styles.saveButton} onClick={handleProfileSaveClick}>
                  <SaveIcon sx={{ fontSize: 18 }} />
                  <span>Update</span>
                </button>
                <button className={styles.cancelButton} onClick={handleProfileCancel}>
                  <CancelIcon sx={{ fontSize: 18 }} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button className={styles.editButton} onClick={handleProfileEditClick}>
                <EditIcon sx={{ fontSize: 18 }} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Payment Details Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: 'var(--primary-color)' }} />
            </div>
            <h2 className={styles.cardTitle}>Payment Details</h2>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Account Number</label>
              <div className={styles.infoValue}>
                {isPaymentEditing ? (
                  <input
                    type="text"
                    value={paymentInfo.accountNumber}
                    onChange={(e) => handlePaymentChange('accountNumber', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter account number"
                  />
                ) : (
                  <span className={styles.infoText}>{paymentInfo.accountNumber}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Account Holder Name</label>
              <div className={styles.infoValue}>
                {isPaymentEditing ? (
                  <input
                    type="text"
                    value={paymentInfo.accountHolderName}
                    onChange={(e) => handlePaymentChange('accountHolderName', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter account holder name"
                  />
                ) : (
                  <span className={styles.infoText}>{paymentInfo.accountHolderName}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>IFSC Code</label>
              <div className={styles.infoValue}>
                {isPaymentEditing ? (
                  <input
                    type="text"
                    value={paymentInfo.ifscCode}
                    onChange={(e) => handlePaymentChange('ifscCode', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter IFSC code"
                  />
                ) : (
                  <span className={styles.infoText}>{paymentInfo.ifscCode}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Bank Name</label>
              <div className={styles.infoValue}>
                {isPaymentEditing ? (
                  <input
                    type="text"
                    value={paymentInfo.bankName}
                    onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter bank name"
                  />
                ) : (
                  <span className={styles.infoText}>{paymentInfo.bankName}</span>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>UPI ID</label>
              <div className={styles.infoValue}>
                {isPaymentEditing ? (
                  <input
                    type="text"
                    value={paymentInfo.upiId}
                    onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter UPI ID (e.g., user@paytm)"
                  />
                ) : (
                  <span className={styles.infoText}>{paymentInfo.upiId || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.cardActions}>
            {isPaymentEditing ? (
              <>
                <button className={styles.saveButton} onClick={handlePaymentSaveClick}>
                  <SaveIcon sx={{ fontSize: 18 }} />
                  <span>Update</span>
                </button>
                <button className={styles.cancelButton} onClick={handlePaymentCancel}>
                  <CancelIcon sx={{ fontSize: 18 }} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button className={styles.editButton} onClick={handlePaymentEditClick}>
                <EditIcon sx={{ fontSize: 18 }} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
    </div>
  );
};

export default ProfilePage;
