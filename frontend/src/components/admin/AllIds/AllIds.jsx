import React, { useState, useEffect, useRef } from "react";
import styles from "./AllIds.module.css";
import TopNavbar from "../../Navbar/TopNavbar";
import { useUser } from "../../../context/UserContext";
import { getImageUrl } from "../../../utils/imageUrl";
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { FiEdit3, FiSave, FiEye, FiEyeOff } from "react-icons/fi";
import { Toast } from "primereact/toast";
import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import IdDepositPopup from "../../Id/IdDepositPopup";
import WithdrawalPopup from "../../Id/WithdrawalPopup";
import { checkIsSuperAdmin } from "../../../utils/roles";

const AllIds = () => {
  const toast = useRef(null); // Add a reference for Toast
  const { user, url } = useUser();
  const safeUser = user || {};
  const safeUrl = url || '';

  const isSuperAdmin = checkIsSuperAdmin(safeUser);
  const canManageIdRequests = isSuperAdmin || safeUser?.permissions?.canManageIdRequests !== false;
  const canEditIdCredentials = isSuperAdmin || safeUser?.permissions?.canEditIdCredentials !== false;
  const canManageTransactions = isSuperAdmin || safeUser?.permissions?.canManageTransactions !== false;
  const adminHeaderId = safeUser?.id || safeUser?._id || safeUser?.username || '';

  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdminFilter, setSelectedSubAdminFilter] = useState("all");

  const [myIds, setMyIds] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [needRefetch, setNeedRefetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [activeTab, setActiveTab] = useState('ids'); // 'ids' or 'requests'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 IDs per page

  const [walletBalance, setWalletBalance] = useState(100);
  const [showIdDepositPopup, setShowIdDepositPopup] = useState(false); // State to toggle popup
  const [changePasswordPopup, setChangePasswordPopup] = useState(false); // State to toggle popup
  // const [WithdrawalPopup, setWithdrwalPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);

  
  // Edit form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    comment: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Fetch sub-admins for superadmin
  const fetchSubAdmins = async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch(`${safeUrl}/api/admin/get-subadmins`, {
        headers: { 'x-admin-id': adminHeaderId }
      });
      if (response.ok) {
        const data = await response.json();
        setSubAdmins(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching sub-admins:", err);
    }
  };

  const fetchIds = async (filterId = selectedSubAdminFilter) => {
    try {
      setLoading(true);
      const queryParam = isSuperAdmin && filterId && filterId !== 'all'
        ? `?filterAdminId=${filterId}`
        : '';
      const response = await fetch(`${safeUrl}/api/admin/get-all-ids${queryParam}`, {
        headers: { 'x-admin-id': adminHeaderId }
      });
      const data = await response.json();
      if (response.ok) {
        const idsData = Array.isArray(data) ? data : (data.ids || []);
        setMyIds(idsData);
      } else {
        console.error("Error fetching IDs:", data);
        setError("Failed to fetch IDs");
      }
    } catch (error) {
      console.error("Failed to fetch IDs:", error);
      setError("Failed to fetch IDs");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (filterId = selectedSubAdminFilter) => {
    try {
      const queryParam = isSuperAdmin && filterId && filterId !== 'all'
        ? `?filterAdminId=${filterId}`
        : '';
      const response = await fetch(`${safeUrl}/api/admin/pending-requests${queryParam}`, {
        headers: { 'x-admin-id': adminHeaderId }
      });
      const data = await response.json();
      if (response.ok) {
        const requestsData = Array.isArray(data) ? data : (data.requests || []);
        setPendingRequests(requestsData);
      } else {
        console.error("Error fetching pending requests:", data);
      }
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  };

  // Handle request approval/rejection
  const handleRequestAction = async (requestId, requestType, action) => {
    if (!canManageTransactions) {
      toast.current.show({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'You do not have permission to manage requests',
        life: 3000,
      });
      return;
    }
    try {
      const endpoint = action === 'approve' 
        ? `approve-${requestType.replace('_', '-')}` 
        : `reject-${requestType.replace('_', '-')}`;
      
      const response = await fetch(`${safeUrl}/api/admin/${endpoint}/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': adminHeaderId
        }
      });

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMessage = `Failed to ${action} ${requestType} request`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
            
            // Handle specific withdrawal balance error
            if (errorData.message.includes('Insufficient ID balance') && errorData.currentBalance !== undefined) {
              errorMessage = `Insufficient ID balance: ${errorData.currentBalance} coins available, ${errorData.requiredCoins} coins needed. Shortfall: ${errorData.shortfall} coins.`;
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      toast.current.show({
        severity: 'success',
        summary: action === 'approve' ? 'Approved' : 'Rejected',
        detail: `${requestType.replace('_', ' ')} request ${action}d successfully`,
        life: 3000,
      });

      // Refresh pending requests and IDs
      await fetchPendingRequests();
      setNeedRefetch(true);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 5000, // Show error for longer duration
      });
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSubAdmins();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (safeUser?.id || needRefetch) {
      fetchIds(selectedSubAdminFilter);
      fetchPendingRequests(selectedSubAdminFilter);
      setNeedRefetch(false);
    }
  }, [safeUser?.id, needRefetch, selectedSubAdminFilter]);
  
// Accept API Call
const handleAccept = async (item) => {
  if (!canManageIdRequests) {
    toast.current.show({
      severity: 'error',
      summary: 'Permission Denied',
      detail: 'You do not have permission to manage ID requests',
      life: 3000,
    });
    return;
  }
  try {
    const response = await fetch(
      `${safeUrl}/api/admin/accept-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminHeaderId
        },
        body: JSON.stringify({
          id: item.id, // Send the current ID
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to accept ID");
    }
    toast.current.show({
      severity: 'success',
      summary: 'ID Accepted',
      detail: 'ID Accepted Successfully',
      life: 1000,
    });
    setNeedRefetch(true); // Trigger refetch to get updated data
  } catch (err) {
    console.error(err.message);
    toast.current.show({
      severity: 'error',
      summary: 'Error accepting',
      detail: err.message || 'Error accepting ID',
      life: 3000,
    });
  }
};

// Reject API Call
const handleReject = async (item) => {
  if (!canManageIdRequests) {
    toast.current.show({
      severity: 'error',
      summary: 'Permission Denied',
      detail: 'You do not have permission to manage ID requests',
      life: 3000,
    });
    return;
  }
  try {
    const response = await fetch(
      `${safeUrl}/api/admin/reject-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminHeaderId
        },
        body: JSON.stringify({
          id: item.id, // Send the current ID
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reject ID");
    }

    toast.current.show({
      severity: 'error',
      summary: 'ID Rejected',
      detail: 'ID Rejected Successfully',
      life: 1000,
    });
    setNeedRefetch(true); // Trigger refetch to get updated data
  } catch (err) {
    console.error(err.message);
    toast.current.show({
      severity: 'error',
      summary: 'Rejecting error',
      detail: err.message || 'Error rejecting ID',
      life: 3000,
    });

  }
};

  const handleIdClick = (item) => {
    setSelectedId(item);
    // console.log(item);
    setChangePasswordPopup(true)
  };

  const handleClosePopup = () => {
    setSelectedId(null);
    setIsEditMode(false);
    setEditFormData({ username: "", password: "", comment: "" });
    setEditErrors({});
    setShowPassword(false);
  };

  const handleEditModeToggle = () => {
    if (!isEditMode && selectedId) {
      setEditFormData({
        username: selectedId.username || "",
        password: selectedId.password || "",
        comment: selectedId.comment || ""
      });
    }
    setIsEditMode(!isEditMode);
    setEditErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!editFormData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    if (!canEditIdCredentials) {
      toast.current.show({
        severity: 'error',
        summary: 'Permission Denied',
        detail: 'You do not have permission to edit ID credentials',
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`${safeUrl}/api/admin/update-id`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminHeaderId
        },
        body: JSON.stringify({
          id: selectedId.id,
          username: editFormData.username.trim(),
          password: editFormData.password.trim(),
          comment: editFormData.comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ID");
      }

      // Update local state to reflect changes immediately
      setSelectedId(prev => ({
        ...prev,
        username: editFormData.username.trim(),
        password: editFormData.password.trim(),
        comment: editFormData.comment.trim()
      }));

      // Update the main list as well without refetching if possible, but refetch is safer
      setMyIds(prevIds => 
        prevIds.map(id => 
          id.id === selectedId.id 
            ? { 
                ...id, 
                username: editFormData.username.trim(),
                password: editFormData.password.trim(),
                comment: editFormData.comment.trim() 
              } 
            : id
        )
      );

      toast.current.show({
        severity: "success",
        summary: "ID Updated",
        detail: "ID information updated successfully",
        life: 3000,
      });

      setIsEditMode(false);
      setNeedRefetch(true);
    } catch (error) {
      console.error("Error updating ID:", error);
      
      toast.current.show({
        severity: "error",
        summary: "Update Failed",
        detail: error.message || "Failed to update ID information",
        life: 3000,
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp (has _seconds)
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString();
      }
      
      // Handle standard date string or number
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Error Date';
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!safeUser?.id || !selectedId?.id) {
        throw new Error("User ID or selected ID is missing");
      }

      const response = await fetch(
        `${safeUrl}/api/user/change-id-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: safeUser.id,
            selectedId: selectedId.id,
            newPassword: newPassword,
          }),
        }
      );

      if (!response.ok) {
        toast.current.show({
          severity: 'error',
          summary: 'Failed Change',
          detail: 'Failed to change password',
          life: 1000,
        });
        throw new Error("Failed to change password");
      }

      toast.current.show({
        severity: 'success',
        summary: 'Password changed',
        detail: 'Password changed successfully',
        life: 1000,
      });
      const data = await response.json();

      setNewPassword("");
      setSelectedId(null);

      setNeedRefetch(true);
    } catch (err) {
      console.error(err);
      alert("Error changing password");
    }
  };

  const handleDepositClick = (item) => {
    // console.log(item)
    setSelectedId(item)
    setChangePasswordPopup(false)
    setIsWithdrawalPopupVisible(false)
    setShowIdDepositPopup(true); // Show deposit popup
  };
  const handleWithdrawalClick = (item) => {
    // console.log(item)
    setSelectedId(item)
    setChangePasswordPopup(false)
    setShowIdDepositPopup(false); // Show deposit popup
    setIsWithdrawalPopupVisible(true);
  }

  const closeDepositPopup = () => {
    setShowIdDepositPopup(false); // Close deposit popup
  };
  const closeWithdrawalPopup = () => {
    setIsWithdrawalPopupVisible(false); // Close withdrawal popup
  };



  const handleCreateId = () => {
    setNeedRefetch(true);
  };

  const filteredIds = (myIds || []).filter(
    (id) => {
      if (!id || typeof id !== 'object') {
        return false;
      }
      
      // Skip empty objects
      if (Object.keys(id).length === 0) {
        return false;
      }
      
      const query = searchQuery.toLowerCase();
      return (
        (id.websiteName && id.websiteName.toLowerCase().includes(query)) ||
        (id.websiteUrl && id.websiteUrl.toLowerCase().includes(query)) ||
        (id.username && id.username.toLowerCase().includes(query)) ||
        (id.idType && id.idType.toLowerCase().includes(query)) ||
        (id.idNumber && id.idNumber.toLowerCase().includes(query)) ||
        (id.userId && id.userId.toLowerCase().includes(query)) ||
        (id.createdBy && id.createdBy.toLowerCase().includes(query)) ||
        (id.id && id.id.toLowerCase().includes(query))
      );
    }
  );

  const filteredRequests = (pendingRequests || []).filter(
    (request) =>
      (request.websiteName && request.websiteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.username && request.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.createdBy && request.createdBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const currentData = activeTab === 'ids' ? filteredIds : filteredRequests;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Get request type display info
  const getRequestTypeInfo = (requestType) => {
    switch (requestType) {
      case 'deposit':
        return { label: 'Deposit Request', color: '#22c55e', icon: '💰' };
      case 'withdrawal':
        return { label: 'Withdrawal Request', color: '#f59e0b', icon: '💸' };
      case 'close_id':
        return { label: 'Close ID Request', color: '#ef4444', icon: '🔒' };
      case 'password_change':
        return { label: 'Password Change Request', color: '#8b5cf6', icon: '🔑' };
      default:
        return { label: 'Unknown Request', color: '#6b7280', icon: '❓' };
    }
  };

  // Render request item
  const renderRequestItem = (request, index) => {
    // Validate request data
    if (!request || typeof request !== 'object') {
      console.error('Invalid request data:', request);
      return null;
    }

    const typeInfo = getRequestTypeInfo(request.requestType);
    
    // Generate unique key
    const uniqueKey = `${request.id || 'unknown'}-${request.transactionId || request.transactionDocumentId || index}`;
    
    return (
      <div key={uniqueKey} className={styles.idCard}>
        <div className={styles.logo}>
          <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
        </div>

        <div className={styles.details}>
          <p className={styles.websiteName} style={{ color: typeInfo.color }}>
            {typeInfo.label}
          </p>
          <a
            href={request.websiteUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.websiteLink}
            style={{ display: 'inline' }}
          >
            {request.websiteUrl || 'N/A'}
          </a>
          <p className={styles.userId}>
            <strong>User ID:</strong> {request.createdBy || 'N/A'}
          </p>
          {request.username && (
            <p className={styles.userId}>
              <strong>Username:</strong> {request.username}
            </p>
          )}
          {request.amount && (
            <p className={styles.userId}>
              <strong>Amount:</strong> ₹{request.amount}
            </p>
          )}
          {request.coinsToReceive && (
            <p className={styles.userId}>
              <strong>Coins to Receive:</strong> {request.coinsToReceive}
            </p>
          )}
          {request.coinsNeeded && (
            <p className={styles.userId}>
              <strong>Coins Needed:</strong> {request.coinsNeeded}
            </p>
          )}
          {request.coinRate && (
            <p className={styles.userId}>
              <strong>Coin Rate:</strong> ₹{request.coinRate} per coin
            </p>
          )}
          {request.reason && (
            <p className={styles.userId}>
              <strong>Reason:</strong> {request.reason}
            </p>
          )}
          {request.withdrawalMethod && (
            <p className={styles.userId}>
              <strong>Withdrawal Method:</strong> {request.withdrawalMethod}
            </p>
          )}
          {request.withdrawalDetails && (
            <div className={styles.userId}>
              <strong>Withdrawal Details:</strong>
              {request.withdrawalMethod === 'upi' ? (
                <p>UPI ID: {request.withdrawalDetails.upiId || 'N/A'}</p>
              ) : (
                <div>
                  <p>Account Number: {request.withdrawalDetails.accountNumber || 'N/A'}</p>
                  <p>Account Holder: {request.withdrawalDetails.accountHolderName || 'N/A'}</p>
                  <p>IFSC Code: {request.withdrawalDetails.ifscCode || 'N/A'}</p>
                  <p>Bank Name: {request.withdrawalDetails.bankName || 'N/A'}</p>
                </div>
              )}
            </div>
          )}
          {request.newPassword && (
            <p className={styles.userId}>
              <strong>New Password:</strong> {request.newPassword}
            </p>
          )}

          <p className={styles.userId}>
            <strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        <div className={styles.iconContainer}>
          <div className={styles.statusContainer}>
            <p className={styles.statusText}>
              <span className={styles.statusPending}>
                {request.status}
              </span>
            </p>
          </div>

          {canManageTransactions && (
            <div className={styles.actionIcons}>
              <button
                className={`${styles.icon} ${styles.acceptIcon}`}
                title="Approve Request"
                onClick={() => handleRequestAction(request.id, request.requestType, 'approve')}
              >
                <AiOutlineCheckCircle />
              </button>

              <button
                className={`${styles.icon} ${styles.rejectIcon}`}
                title="Reject Request"
                onClick={() => handleRequestAction(request.id, request.requestType, 'reject')}
              >
                <AiOutlineCloseCircle />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <TopNavbar />
        <div className={styles.loading}>
          <PulseLoader color="var(--primary-color)" loading={loading} size={15} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <TopNavbar />
        <p className={styles.error}>
          <strong>No Id's created yet</strong>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNavbar />
      <div className={styles.container}>
      {/* Superadmin Sub-Admin Filter */}
      {isSuperAdmin && (
        <div className="global-admin-filter-container">
          <span className="global-admin-filter-label">Filter by Admin Master:</span>
          <select
            value={selectedSubAdminFilter}
            onChange={(e) => setSelectedSubAdminFilter(e.target.value)}
            className="global-admin-filter-select"
          >
            <option value="all">All Admin Masters</option>
            {subAdmins.map(sa => (
              <option key={sa._id} value={sa._id}>
                {sa.username} (Admin Master)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.bottomNavbar}>
        <button
          className={`${styles.navButton} ${activeTab === 'ids' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('ids')}
        >
          All IDs ({myIds.length})
        </button>
        <div className={styles.centerDivider}></div>
        <button
          className={`${styles.navButton} ${activeTab === 'requests' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={`Search by ${activeTab === 'ids' ? 'website name, URL, username, ID type, or ID number' : 'website name, username, or user ID'}`}
        className={styles.searchInput}
      />

      {currentData.length === 0 ? (
        <p className={styles.noIds}>
          No {activeTab} match your search criteria.
        </p>
      ) : (
        currentItems.map((item, index) => {
          if (activeTab === 'ids') {
            // Validate ID item data
            if (!item || typeof item !== 'object') {
              console.error('Invalid ID item data:', item);
              return null;
            }
            
            // Skip empty objects
            if (Object.keys(item).length === 0) {
              return null;
            }

            // Check if this is a website ID or generic ID
            const isWebsiteId = item.websiteName && item.websiteUrl;
            const isGenericId = item.idType && item.idNumber;

            // Render ID item
            return (
          <div key={item.id} className={styles.idCard}>
                <div className={styles.logo}>
                  {isWebsiteId ? (
              <img
                src={getImageUrl(item.imgUrl, safeUrl)}
                alt={`${item.websiteName || 'Website'} logo`}
              />
                  ) : (
                    <span style={{ fontSize: '24px' }}>🆔</span>
                  )}
            </div>

            <div className={styles.details}>
                  {isWebsiteId ? (
                    <>
              <p className={styles.websiteName}>{item.websiteName || 'N/A'}</p>
                <a
                  href={item.websiteUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  {item.websiteUrl || 'N/A'}
                </a>
                      {item.username && (
                        <p className={styles.userId}>
                          <strong>Username:</strong> {item.username}
                        </p>
                      )}
                      {item.balance !== undefined && (
                        <p className={styles.userId}>
                          <strong>Last Updated Balance:</strong> {item.balance} coins
                        </p>
                      )}
                      {item.coinRate && (
                        <p className={styles.userId}>
                          <strong>Coin Rate:</strong> ₹{item.coinRate} per coin
                        </p>
                      )}
                    </>
                  ) : isGenericId ? (
                    <>
                      <p className={styles.websiteName}>ID Document</p>
                      <p className={styles.userId}>
                        <strong>Type:</strong> {item.idType || 'N/A'}
                      </p>
                      <p className={styles.userId}>
                        <strong>Number:</strong> {item.idNumber || 'N/A'}
                      </p>
                      <p className={styles.userId}>
                        <strong>User ID:</strong> {item.userId || 'N/A'}
                      </p>
                      <p className={styles.userId}>
                        <strong>Verified:</strong> {item.isVerified ? 'Yes' : 'No'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={styles.websiteName}>Unknown ID Type</p>
                      <p className={styles.userId}>
                        <strong>ID:</strong> {item.id || 'N/A'}
                      </p>
                    </>
                  )}
                  
                  <p className={styles.userId}>
                    <strong>CreatedBy:</strong> {item.createdBy || 'N/A'}
                  </p>
                  
                  {item.createdAt && (
              <p className={styles.userId}>
                      <strong>Created:</strong> {
                        item.createdAt._seconds 
                          ? new Date(item.createdAt._seconds * 1000).toLocaleString()
                          : new Date(item.createdAt).toLocaleString()
                      }
                    </p>
                  )}
            </div>

            <div className={styles.iconContainer}>
              <div className={styles.statusContainer}>
                <p className={styles.statusText}>
                  <span
                    className={
                      item.status === "Requested"
                        ? styles.statusRequested
                        : item.status === "Created"
                        ? styles.statusCreated
                            : item.status === "Accepted"
                            ? styles.statusAccepted
                            : item.status === "Rejected"
                            ? styles.statusRejected
                            : item.status === "Pending"
                            ? styles.statusPending
                        : item.status === "Username Exists"
                        ? styles.statusUsernameExist
                        : styles.statusActive // Default case if no match
                    }
                  >
                        {item.status || 'Unknown'}
                  </span>
                </p>
              </div>

              <div className={styles.actionIcons}>
                {canEditIdCredentials && (
                  <button
                    className={`${styles.icon} ${styles.editIcon}`}
                    title="Edit ID"
                    onClick={() => handleIdClick(item)}
                  >
                    <FiEdit3 />
                  </button>
                )}

                {canManageIdRequests && (
                  <>
                    <AiOutlineCheckCircle
                      style={{ color: "green", fontSize: "30px", cursor: "pointer" }}
                      className={`${styles.icon} ${styles.acceptIcon}`}
                      title="Accept"
                      onClick={() => handleAccept(item)}
                    />

                    <AiOutlineCloseCircle
                      style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
                      className={`${styles.icon} ${styles.rejectIcon}`}
                      title="Reject"
                      onClick={() => handleReject(item)}
                    />
                  </>
                )}
              </div>
            </div>
              </div>
            );
          } else {
            // Render request item
            return renderRequestItem(item, index);
          }
        })
      )}

      {/* Pagination Controls */}
      {currentData.length > itemsPerPage && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} {activeTab}
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className={styles.pageEllipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageButton} ${
                        page === currentPage ? styles.activePage : ''
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedId && changePasswordPopup && (
        <div className={styles.popupOverlay}>
        <div className={styles.popup}>
            <button onClick={handleClosePopup} className={styles.closeButton}>
              &times;
            </button>
            
            <div className={styles.popupHeader}>
              <img
                src={getImageUrl(selectedId.imgUrl, safeUrl)}
                alt={`${selectedId.websiteName || 'Website'} logo`}
                className={styles.popupLogo}
              />
              <div className={styles.headerInfo}>
              <h2>{selectedId.websiteName || 'N/A'}</h2>
                <p className={styles.websiteUrl}>{selectedId.websiteUrl || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.popupBody}>
              {!isEditMode ? (
                // View Mode
                <>
                  <div className={styles.infoRow}>
                    <label>Username:</label>
                    <span className={styles.infoValue}>{selectedId.username || 'N/A'}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Password:</label>
                    <div className={styles.passwordContainer}>
                      <span className={styles.infoValue}>
                        {showPassword ? selectedId.password || 'N/A' : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Status:</label>
                  <span
                      className={`${styles.statusBadge} ${
                        selectedId.status === "Requested"
                          ? styles.statusRequested
                        : selectedId.status === "Created"
                          ? styles.statusCreated
                          : selectedId.status === "Accepted"
                          ? styles.statusAccepted
                          : selectedId.status === "Rejected"
                          ? styles.statusRejected
                          : selectedId.status === "Pending"
                          ? styles.statusPending
                        : selectedId.status === "Username Exists"
                          ? styles.statusUsernameExist
                          : styles.statusActive
                      }`}
                  >
                    {selectedId.status}
                  </span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <label>Created At:</label>
                    <span className={styles.infoValue}>
                {formatDate(selectedId.createdAt)}
                    </span>
            </div>

                  {selectedId.comment && (
                    <div className={styles.infoRow}>
                      <label>Comment:</label>
                      <span className={styles.infoValue}>{selectedId.comment}</span>
                    </div>
                  )}
                </>
              ) : (
                // Edit Mode
                <form className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="editUsername">Username *</label>
                    <input
                      type="text"
                      id="editUsername"
                      name="username"
                      value={editFormData.username}
                      onChange={handleEditInputChange}
                      className={`${styles.editInput} ${editErrors.username ? styles.inputError : ""}`}
                      placeholder="Enter username"
                    />
                    {editErrors.username && (
                      <span className={styles.errorText}>{editErrors.username}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editPassword">Password *</label>
                    <div className={styles.passwordInputContainer}>
              <input
                        type={showPassword ? "text" : "password"}
                        id="editPassword"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        className={`${styles.editInput} ${editErrors.password ? styles.inputError : ""}`}
                        placeholder="Enter password"
              />
              <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {editErrors.password && (
                      <span className={styles.errorText}>{editErrors.password}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editComment">Comment / Remark</label>
                    <textarea
                      id="editComment"
                      name="comment"
                      value={editFormData.comment}
                      onChange={handleEditInputChange}
                      className={styles.editTextarea}
                      placeholder="Add any comments or remarks..."
                      rows={3}
                    />
                  </div>
                </form>
              )}
            </div>

            <div className={styles.popupActions}>
              {!isEditMode ? (
                <>
                  {canEditIdCredentials && (
                    <button
                      onClick={handleEditModeToggle}
                      className={styles.editButton}
                    >
                      <FiEdit3 /> Edit
                    </button>
                  )}
                  <button
                    onClick={handleClosePopup}
                    className={styles.cancelButton}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditSubmit}
                    className={styles.saveButton}
                  >
                    <FiSave /> Save
                  </button>
                  <button
                    onClick={handleEditModeToggle}
                    className={styles.cancelButton}
                  >
                    Cancel
              </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Deposit Popup */}
      {showIdDepositPopup && (
        <IdDepositPopup
          onClose={closeDepositPopup}
          walletBalance={walletBalance} // Pass the wallet balance dynamically
          setWalletBalance={setWalletBalance} // Pass the setWalletBalance function
          selectedId={selectedId} // Pass the selected ID to the popup component
        />
      )}

{/* //withdrawalpopup */}
      {isWithdrawalPopupVisible && (
        <WithdrawalPopup
          onClose={closeWithdrawalPopup}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          selectedId={selectedId}
        />
      )}


      
      <Toast ref={toast} />

      </div>
    </div>
  );
};

export default AllIds;
