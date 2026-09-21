import React, { useState, useEffect, useRef } from "react";
import styles from "./Users.module.css";
import TopNavbar from "../../Navbar/TopNavbar";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { PulseLoader } from "react-spinners";
import { Toast } from "primereact/toast";
import { useUser } from "../../../context/UserContext";
import { checkIsSuperAdmin } from "../../../utils/roles";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tempBalance, setTempBalance] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [tempAgentCode, setTempAgentCode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingBalance, setUpdatingBalance] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [updatingAgentCode, setUpdatingAgentCode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(12);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userPaymentDetails, setUserPaymentDetails] = useState(null);
    const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
    const [subAdmins, setSubAdmins] = useState([]);
    const [selectedSubAdminFilter, setSelectedSubAdminFilter] = useState("all");
    const [addUserFormData, setAddUserFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        agentCode: '',
        targetAdminId: '',
    });
    const [addUserErrors, setAddUserErrors] = useState({});
    const [addingUser, setAddingUser] = useState(false);
    const toast = useRef(null);
    const { user, url } = useUser();

    // Permission flags
    const isSuperAdmin = checkIsSuperAdmin(user);
    const canCreateUsers = isSuperAdmin || user?.permissions?.canCreateUsers !== false;
    const canUpdateUserBalance = isSuperAdmin || user?.permissions?.canUpdateUserBalance !== false;
    const canChangeUserPassword = isSuperAdmin || user?.permissions?.canChangeUserPassword !== false;
    const canDeleteUsers = isSuperAdmin || user?.permissions?.canDeleteUsers !== false;

    const adminHeaderId = user?.id || user?._id || user?.username || '';

    // Function to get user initials
    const getUserInitials = (name) => {
        if (!name) return 'U';
        
        const nameParts = name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        } else if (nameParts.length >= 2) {
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
        return 'U';
    };

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate phone number format
    const validatePhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

    // Fetch list of sub-admins (for superadmin only)
    const fetchSubAdmins = async () => {
        if (!isSuperAdmin) return;
        try {
            const response = await fetch(`${url}/api/admin/get-subadmins`, {
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

    // Handle add user form input changes
    const handleAddUserChange = (e) => {
        const { name, value } = e.target;
        setAddUserFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle add user form submission
    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation logic
        if (!addUserFormData.name.trim()) newErrors.name = 'Name is required.';
        if (!addUserFormData.username.trim()) newErrors.username = 'Username is required.';
        if (!addUserFormData.email.trim()) newErrors.email = 'Email is required.';
        else if (!validateEmail(addUserFormData.email)) newErrors.email = 'Enter a valid email.';

        if (!addUserFormData.password) newErrors.password = 'Password is required.';
        else if (addUserFormData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

        if (!addUserFormData.confirmPassword) newErrors.confirmPassword = 'Confirm your password.';
        else if (addUserFormData.password !== addUserFormData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

        if (!addUserFormData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
        else if (!validatePhoneNumber(addUserFormData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits.';

        setAddUserErrors(newErrors);

        // If no errors, submit the form
        if (Object.keys(newErrors).length === 0) {
            setAddingUser(true);
            try {
                const payload = {
                    name: addUserFormData.name,
                    username: addUserFormData.username,
                    email: addUserFormData.email,
                    password: addUserFormData.password,
                    phoneNumber: addUserFormData.phoneNumber,
                    agentCode: addUserFormData.agentCode,
                    targetAdminId: isSuperAdmin ? addUserFormData.targetAdminId : adminHeaderId,
                };

                const response = await fetch(`${url}/api/admin/create-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-id': adminHeaderId,
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'User Created',
                        detail: 'New user created successfully',
                        life: 2000,
                    });
                    
                    // Reset form
                    setAddUserFormData({
                        name: '',
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '',
                        agentCode: '',
                        targetAdminId: '',
                    });
                    setAddUserErrors({});
                    setShowAddUserModal(false);
                    
                    // Refresh users list
                    fetchUsers(selectedSubAdminFilter);
                } else {
                    const errorData = await response.json();
                    toast.current.show({
                        severity: 'error',
                        summary: 'Creation Failed',
                        detail: errorData.message || 'Failed to create user',
                        life: 2000,
                    });
                }
            } catch (error) {
                console.error('Error creating user:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Creation Failed',
                    detail: 'An error occurred while creating user',
                    life: 2000,
                });
            } finally {
                setAddingUser(false);
            }
        }
    };

    // Handle close add user modal
    const handleCloseAddUserModal = () => {
        setShowAddUserModal(false);
        setAddUserFormData({
            name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            agentCode: '',
            targetAdminId: '',
        });
        setAddUserErrors({});
    };

    const fetchUsers = async (subAdminFilter = selectedSubAdminFilter) => {
        setLoading(true);
        try {
            const queryParam = isSuperAdmin && subAdminFilter && subAdminFilter !== 'all' 
                ? `?filterAdminId=${subAdminFilter}` 
                : '';
            const response = await fetch(`${url}/api/admin/get-all-users${queryParam}`, {
                headers: {
                    'x-admin-id': adminHeaderId,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
            setCurrentPage(1); // Reset to first page when fetching new data
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
      
    const handleUpdateBalance = async () => {
        if (!selectedUser || tempBalance === "") return;
        
        setUpdatingBalance(true);
        try {
            const response = await fetch(`${url}/api/admin/update-user-balance/${selectedUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': adminHeaderId,
                },
                body: JSON.stringify({ balance: tempBalance }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update balance');
            }
            
            const updatedUser = await response.json();
            
            // Update the users state with the new balance
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === updatedUser.id ? { ...user, balance: updatedUser.balance } : user
                )
            );
            
            toast.current.show({
                severity: 'success',
                summary: 'Balance Updated',
                detail: 'User balance updated successfully',
                life: 2000,
            });
            
            setSelectedUser((prev) => ({ ...prev, balance: updatedUser.balance }));
            setTempBalance("");
            handleClosePopup();
        } catch (error) {
            console.error('Error updating balance:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: 'Error while updating balance',
                life: 2000,
            });
        } finally {
            setUpdatingBalance(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!selectedUser || tempPassword === "") return;
        
        setUpdatingPassword(true);
        try {
            const response = await fetch(`${url}/api/admin/change-user-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': adminHeaderId,
                },
                body: JSON.stringify({ 
                    userId: selectedUser.id, 
                    newPassword: tempPassword 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update password');
            }
            
            toast.current.show({
                severity: 'success',
                summary: 'Password Updated',
                detail: 'User password updated successfully',
                life: 2000,
            });
            
            setTempPassword("");
            handleClosePopup();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: 'Error while updating password',
                life: 2000,
            });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleUpdateAgentCode = async () => {
        if (!selectedUser) return;
        
        setUpdatingAgentCode(true);
        try {
            const response = await fetch(`${url}/api/admin/update-user-agent-code/${selectedUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': adminHeaderId,
                },
                body: JSON.stringify({ 
                    agentCode: tempAgentCode 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update agent code');
            }
            
            toast.current.show({
                severity: 'success',
                summary: 'Agent Code Updated',
                detail: 'User agent code updated successfully',
                life: 2000,
            });
            
            // Update the users state with the new agent code
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === selectedUser.id ? { ...user, agentCode: tempAgentCode } : user
                )
            );
            
            setSelectedUser((prev) => ({ ...prev, agentCode: tempAgentCode }));
            handleClosePopup();
        } catch (error) {
            console.error('Error updating agent code:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: 'Error while updating agent code',
                life: 2000,
            });
        } finally {
            setUpdatingAgentCode(false);
        }
    };

    const handleUserClick = async (user) => {
        fetchUsers(selectedSubAdminFilter);
        const latestUser = users.find((u) => u.id === user.id);
        setSelectedUser(latestUser);
        setTempBalance(latestUser.balance || "0");
        setTempAgentCode(latestUser.agentCode || "");
        
        // Fetch payment details for the user
        await fetchUserPaymentDetails(user.id);
    };

    // Function to fetch user payment details
    const fetchUserPaymentDetails = async (userId) => {
        setLoadingPaymentDetails(true);
        try {
            const response = await fetch(`${url}/api/user/get-accountdetails?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserPaymentDetails(data);
            } else {
                setUserPaymentDetails(null);
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
            setUserPaymentDetails(null);
        } finally {
            setLoadingPaymentDetails(false);
        }
    };

    const handleClosePopup = () => {
        setSelectedUser(null);
        setTempBalance("");
        setTempPassword("");
        setTempAgentCode("");
        setUserPaymentDetails(null);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${url}/api/admin/delete-user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-id': adminHeaderId,
                },
            });
      
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            
            toast.current.show({
                severity: 'success',
                summary: 'User Deleted',
                detail: `User "${userName}" deleted successfully`,
                life: 2000,
            });
      
            // Update local state to remove the user
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Delete Failed',
                detail: 'Error while deleting user',
                life: 2000,
            });
            console.error("Error deleting user:", error);
        }
    };

    // Fetch users and subadmins on mount or filter change
    useEffect(() => {
        fetchUsers(selectedSubAdminFilter);
        if (isSuperAdmin) {
            fetchSubAdmins();
        }
    }, [selectedSubAdminFilter]);

    // Prevent background scroll when modals are open
    useEffect(() => {
        if (showAddUserModal || selectedUser) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAddUserModal, selectedUser]);

    // Filter users based on search query
    const filteredUsers = (users || []).filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase()) // Search by user ID
    );

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
            <div className={styles.container}>
                <TopNavbar />
                <div className={styles.loading}>
                    <PulseLoader color="var(--primary-color)" loading={loading} size={20} />
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <TopNavbar />
                <div className={styles.emptyState}>
                    <h3>Error Loading Users</h3>
                    <p>{error}</p>
                    <button 
                        onClick={fetchUsers}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#3267d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Toast ref={toast} />
            <TopNavbar />
            
            <div className={styles.headerSection}>
                <h2 className={styles.heading}>
                    <strong>Users Management</strong>
                </h2>
                {canCreateUsers && (
                    <button 
                        className={styles.addUserButton}
                        onClick={() => setShowAddUserModal(true)}
                    >
                        <AddIcon className={styles.addIcon} />
                        Add User
                    </button>
                )}
            </div>

            {/* Superadmin Sub-admin Filter */}
            {isSuperAdmin && (
                <div className={styles.filterContainer}>
                    <span className={styles.filterLabel}>Filter by Admin Master:</span>
                    <select
                        value={selectedSubAdminFilter}
                        onChange={(e) => {
                            setSelectedSubAdminFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={styles.subAdminFilterSelect}
                    >
                        <option value="all">All Admin Masters</option>
                        {subAdmins.map((sa) => (
                            <option key={sa.id} value={sa.id}>
                                {sa.username} {sa.name ? `(${sa.name})` : ''} - {sa.userCount || 0} users
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search Container */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                    }}
                    placeholder="Search by name, username, phone, email, or ID..."
                    className={styles.searchInput}
                />
            </div>

            {/* Users Count */}
            <div className={styles.usersCount}>
                {filteredUsers.length === 0 ? 'No users found' : `${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'} found`}
                {filteredUsers.length > usersPerPage && (
                    <span> • Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}</span>
                )}
            </div>

            {/* Users List */}
            <div className={styles.userList}>
                {currentUsers.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h3>No Users Found</h3>
                        <p>Try adjusting your search criteria or check if there are any users in the system.</p>
                    </div>
                ) : (
                    currentUsers.map((user) => (
                        <div
                            key={user.id}
                            className={styles.userCard}
                            onClick={() => handleUserClick(user)}
                        >
                            <div className={styles.userCardContent}>
                                {/* Initials Avatar */}
                                <div className={styles.initialsAvatar}>
                                    {getUserInitials(user.name)}
                                </div>

                                {/* User Details */}
                                <div className={styles.userDetails}>
                                    <p>
                                        <strong>Name:</strong> {user.name || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Username:</strong> {user.username || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> {user.phoneNumber || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Balance:</strong> ₹{(parseFloat(user.balance) || 0).toFixed(2)}
                                    </p>
                                    {isSuperAdmin && (
                                        <div className={styles.assignedAdminBadge}>
                                            Admin: {user.assignedAdminUsername || 'Superadmin'}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Icon */}
                                {canDeleteUsers && (
                                    <DeleteOutlineIcon
                                        className={styles.deleteIcon}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteUser(user.id, user.name || user.username);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
                <div className={styles.paginationContainer}>
                    {/* Previous Button */}
                    <button
                        className={styles.paginationButton}
                        onClick={prevPage}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((number, index) => (
                        <button
                            key={index}
                            className={`${styles.paginationButton} ${
                                number === currentPage ? styles.active : ''
                            }`}
                            onClick={() => typeof number === 'number' && paginate(number)}
                            disabled={number === '...'}
                        >
                            {number}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button
                        className={styles.paginationButton}
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                    >
                        →
                    </button>

                    {/* Page Info */}
                    <div className={styles.paginationInfo}>
                        Page {currentPage} of {totalPages}
                    </div>
                </div>
            )}

            {/* User Details Popup */}
            {selectedUser && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <button onClick={handleClosePopup} className={styles.closeButton}>
                            &times;
                        </button>
                        
                        <div className={styles.popupHeader}>
                            <h2>{selectedUser.name || 'User Details'}</h2>
                        </div>
                        
                        <div className={styles.popupBody}>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                            <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
                            <p><strong>Phone Number:</strong> {selectedUser.phoneNumber || 'N/A'}</p>
                            <p><strong>Agent Code:</strong> {selectedUser.agentCode || 'N/A'}</p>
                            <p><strong>Last Updated Balance:</strong> ₹{(parseFloat(selectedUser.balance) || 0).toFixed(2)}</p>
                            {isSuperAdmin && (
                                <p><strong>Assigned Admin Master:</strong> {selectedUser.assignedAdminUsername || 'Superadmin'}</p>
                            )}
                            
                            {/* Payment Details Section */}
                            <div className={styles.paymentDetailsSection}>
                                <h3>Payment Details</h3>
                                {loadingPaymentDetails ? (
                                    <div className={styles.loadingPayment}>
                                        <PulseLoader color="var(--primary-color)" size={8} />
                                        <span style={{ marginLeft: '0.5rem' }}>Loading payment details...</span>
                                    </div>
                                ) : userPaymentDetails ? (
                                    <div className={styles.paymentDetails}>
                                        <p><strong>Account Number:</strong> {userPaymentDetails.accountNumber || 'Not provided'}</p>
                                        <p><strong>Account Holder:</strong> {userPaymentDetails.accountHolderName || 'Not provided'}</p>
                                        <p><strong>IFSC Code:</strong> {userPaymentDetails.ifscCode || 'Not provided'}</p>
                                        <p><strong>Bank Name:</strong> {userPaymentDetails.bankName || 'Not provided'}</p>
                                        <p><strong>UPI ID:</strong> {userPaymentDetails.upiId || 'Not provided'}</p>
                                    </div>
                                ) : (
                                    <p className={styles.noPaymentDetails}>No payment details available</p>
                                )}
                            </div>
                            
                            {/* Update Balance Section */}
                            {canUpdateUserBalance && (
                                <div className={styles.updateBalance}>
                                    <label>
                                        <strong>Update Balance:</strong>
                                    </label>
                                    <input
                                        type="number"
                                        value={tempBalance}
                                        onChange={(e) => setTempBalance(e.target.value)}
                                        className={styles.balanceInput}
                                        placeholder="Enter new balance amount"
                                        min="0"
                                        step="0.01"
                                    />
                                    <button 
                                        onClick={handleUpdateBalance} 
                                        className={styles.updateButton}
                                        disabled={updatingBalance || tempBalance === ""}
                                    >
                                        {updatingBalance ? (
                                            <>
                                                <PulseLoader color="#ffffff" size={8} />
                                                <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                                            </>
                                        ) : (
                                            'Update Balance'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Update Password Section */}
                            {canChangeUserPassword && (
                                <div className={styles.updatePassword}>
                                    <label>
                                        <strong>Update Password:</strong>
                                    </label>
                                    <input
                                        type="password"
                                        value={tempPassword}
                                        onChange={(e) => setTempPassword(e.target.value)}
                                        className={styles.passwordInput}
                                        placeholder="Enter new password"
                                    />
                                    <button 
                                        onClick={handleUpdatePassword} 
                                        className={styles.updateButton}
                                        disabled={updatingPassword || tempPassword === ""}
                                    >
                                        {updatingPassword ? (
                                            <>
                                                <PulseLoader color="#000000" size={8} />
                                                <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Update Agent Code Section */}
                            <div className={styles.updatePassword}>
                                <label>
                                    <strong>Update Agent Code:</strong>
                                </label>
                                <input
                                    type="text"
                                    value={tempAgentCode}
                                    onChange={(e) => setTempAgentCode(e.target.value)}
                                    className={styles.passwordInput}
                                    placeholder="Enter new agent code"
                                />
                                <button 
                                    onClick={handleUpdateAgentCode} 
                                    className={styles.updateButton}
                                    disabled={updatingAgentCode}
                                >
                                    {updatingAgentCode ? (
                                        <>
                                            <PulseLoader color="#000000" size={8} />
                                            <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                                        </>
                                    ) : (
                                        'Update Agent Code'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className={styles.addUserModal}>
                    <div className={styles.addUserModalContent}>
                        <button onClick={handleCloseAddUserModal} className={styles.closeButton}>
                            &times;
                        </button>
                        
                        <div className={styles.addUserModalHeader}>
                            <h2>Add New User</h2>
                        </div>
                        
                        <form onSubmit={handleAddUserSubmit} className={styles.addUserForm}>
                            {isSuperAdmin && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="targetAdminId" className={styles.label}>Assign to Admin Master</label>
                                    <select
                                        id="targetAdminId"
                                        name="targetAdminId"
                                        value={addUserFormData.targetAdminId || ''}
                                        onChange={handleAddUserChange}
                                        className={styles.input}
                                    >
                                        <option value="">Superadmin (Self)</option>
                                        {subAdmins.map((sa) => (
                                            <option key={sa.id} value={sa.id}>
                                                {sa.username} {sa.name ? `(${sa.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter user's name"
                                    value={addUserFormData.name}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.name && <p className={styles.errorText}>{addUserErrors.name}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="username" className={styles.label}>Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter username"
                                    value={addUserFormData.username}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.username && <p className={styles.errorText}>{addUserErrors.username}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={addUserFormData.email}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.email && <p className={styles.errorText}>{addUserErrors.email}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="Enter phone number"
                                    value={addUserFormData.phoneNumber}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.phoneNumber && <p className={styles.errorText}>{addUserErrors.phoneNumber}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="agentCode" className={styles.label}>Agent Code</label>
                                <input
                                    type="text"
                                    id="agentCode"
                                    name="agentCode"
                                    placeholder="Enter agent code"
                                    value={addUserFormData.agentCode}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.agentCode && <p className={styles.errorText}>{addUserErrors.agentCode}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password" className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter password"
                                    value={addUserFormData.password}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.password && <p className={styles.errorText}>{addUserErrors.password}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={addUserFormData.confirmPassword}
                                    onChange={handleAddUserChange}
                                    className={styles.input}
                                />
                                {addUserErrors.confirmPassword && <p className={styles.errorText}>{addUserErrors.confirmPassword}</p>}
                            </div>

                            <div className={styles.formActions}>
                                <button 
                                    type="button" 
                                    onClick={handleCloseAddUserModal}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.submitButton}
                                    disabled={addingUser}
                                >
                                    {addingUser ? (
                                        <>
                                            <PulseLoader color="#000000" size={6} />
                                            <span style={{ marginLeft: '0.4rem', fontSize: '0.15rem' }}>Creating...</span>
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;

