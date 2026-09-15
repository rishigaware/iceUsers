import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../../context/UserContext';
import TopNavbar from '../Navbar/TopNavbar';
import styles from './SubAdmins.module.css';
import { 
  FaUserShield, 
  FaUsers, 
  FaPlus, 
  FaTrash, 
  FaTimes, 
  FaKey, 
  FaCheck, 
  FaGlobe, 
  FaExchangeAlt, 
  FaImages, 
  FaListUl,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const PERMISSION_CONFIG = [
  { key: 'canCreateUsers', label: 'Create Users' },
  { key: 'canUpdateUserBalance', label: 'Refill User Balance' },
  { key: 'canChangeUserPassword', label: 'Change User Password' },
  { key: 'canDeleteUsers', label: 'Delete Users' },
  { key: 'canAddWebsites', label: 'Add Exchange Websites' },
  { key: 'canEditWebsites', label: 'Edit Exchange Websites' },
  { key: 'canDeleteWebsites', label: 'Delete Exchange Websites' },
  { key: 'canManageCategories', label: 'Manage Categories' },
  { key: 'canManageIdRequests', label: 'Manage ID Requests' },
  { key: 'canManageTransactions', label: 'Approve/Reject Transactions' },
  { key: 'canEditIdCredentials', label: 'Edit ID Credentials' },
  { key: 'canManageBanners', label: 'Manage Banners' },
  { key: 'canManageSupportLinks', label: 'Edit Contact / Support Links' },
];

export default function SubAdmins() {
  const { user, url } = useUser();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingPerms, setUpdatingPerms] = useState({});
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [expandedAdmins, setExpandedAdmins] = useState({}); // Default collapsed (empty object)

  const toggleExpand = (adminId) => {
    setExpandedAdmins(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    agentCode: '',
    permissions: {
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
    }
  });

  const showToast = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage({ text: '', type: '' });
    }, 4000);
  };

  const fetchSubAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/api/admin/subadmins`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || user?._id || '',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubAdmins(data);
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to load Admin Masters', 'error');
      }
    } catch (e) {
      console.error('Error fetching subadmins:', e);
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  }, [url, user]);

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins]);

  const handleTogglePermission = async (adminId, permKey, currentValue) => {
    const newValue = !currentValue;
    const updateKey = `${adminId}-${permKey}`;

    // Optimistic UI update
    setSubAdmins(prev => prev.map(a => {
      if (a.id === adminId || a._id === adminId) {
        return {
          ...a,
          permissions: {
            ...a.permissions,
            [permKey]: newValue
          }
        };
      }
      return a;
    }));

    setUpdatingPerms(prev => ({ ...prev, [updateKey]: true }));

    try {
      const res = await fetch(`${url}/api/admin/subadmins/${adminId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || user?._id || '',
        },
        body: JSON.stringify({
          permissions: {
            [permKey]: newValue
          }
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }

      showToast(`Permission updated successfully`);
    } catch (e) {
      console.error('Failed to update permission:', e);
      showToast(e.message || 'Failed to update permission', 'error');
      // Revert optimistic update
      fetchSubAdmins();
    } finally {
      setUpdatingPerms(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const handleDeleteSubAdmin = async (adminId, username) => {
    if (!window.confirm(`Are you sure you want to delete Admin Master "${username}"? Users created by this Admin Master will lose their assigned admin.`)) {
      return;
    }

    try {
      const res = await fetch(`${url}/api/admin/subadmins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || user?._id || '',
        }
      });

      if (res.ok) {
        showToast(`Admin Master "${username}" deleted successfully`);
        setSubAdmins(prev => prev.filter(a => (a.id !== adminId && a._id !== adminId)));
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete Admin Master', 'error');
      }
    } catch (e) {
      console.error('Error deleting Admin Master:', e);
      showToast('Error deleting Admin Master', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.password || !formData.email || !formData.phoneNumber) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      const res = await fetch(`${url}/api/admin/subadmins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || user?._id || '',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Admin Master "${formData.username}" created successfully!`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          username: '',
          password: '',
          email: '',
          phoneNumber: '',
          agentCode: '',
          permissions: {
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
          }
        });
        fetchSubAdmins();
      } else {
        showToast(data.message || 'Failed to create Admin Master', 'error');
      }
    } catch (e) {
      console.error('Error creating Admin Master:', e);
      showToast('Error submitting form', 'error');
    }
  };

  const totalUsersAcrossAdmins = subAdmins.reduce((acc, curr) => acc + (curr.userCount || 0), 0);

  return (
    <div className={styles.container}>
      <TopNavbar />

      {/* Toast Notification */}
      {statusMessage.text && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: statusMessage.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {statusMessage.type === 'error' ? <FaTimes /> : <FaCheck />}
          {statusMessage.text}
        </div>
      )}

      {/* Header matching Users page styling */}
      <div className={styles.headerSection}>
        <h2 className={styles.heading}>
          <strong>Admin Master Management</strong>
        </h2>
        <button className={styles.addUserButton} onClick={() => setIsModalOpen(true)}>
          <FaPlus className={styles.addIcon} />
          Create Admin Master
        </button>
      </div>
      <p className={styles.subtitle}>
        Manage isolated Admin Master accounts, view user allocations, and toggle feature permissions
      </p>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserShield />
          </div>
          <div className={styles.statInfo}>
            <h3>{subAdmins.length}</h3>
            <span>Active Admin Masters</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalUsersAcrossAdmins}</h3>
            <span>Users Assigned to Admin Masters</span>
          </div>
        </div>
      </div>

      {/* Sub-Admin Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.6)' }}>
          Loading Admin Master records...
        </div>
      ) : subAdmins.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Admin Masters Found</h3>
          <p>Create your first Admin Master to delegate tenant user and exchange website management.</p>
          <button className={styles.primaryBtn} style={{ marginTop: '16px' }} onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Add Admin Master
          </button>
        </div>
      ) : (
        <div className={styles.cardList}>
          {subAdmins.map((subAdmin) => {
            const adminId = subAdmin.id || subAdmin._id;
            const perms = subAdmin.permissions || {};
            const isExpanded = Boolean(expandedAdmins[adminId]);
            const activePermsCount = PERMISSION_CONFIG.filter(({ key }) => perms[key]).length;

            return (
              <div 
                key={adminId} 
                className={`${styles.adminCard} ${isExpanded ? styles.adminCardExpanded : styles.adminCardCollapsed}`}
                onClick={() => {
                  if (!isExpanded) {
                    toggleExpand(adminId);
                  }
                }}
              >
                {/* Header bar - Click anywhere on this bar to expand/collapse */}
                <div 
                  className={styles.cardHeader}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(adminId);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  title={isExpanded ? "Click anywhere to collapse" : "Click anywhere to expand"}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(adminId);
                    }
                  }}
                >
                  <div className={styles.adminDetails}>
                    <div className={styles.avatar}>
                      {subAdmin.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className={styles.adminMeta}>
                      <h3>
                        <span className={styles.adminNameText}>{subAdmin.name}</span>
                        <span className={styles.usernameTag}>@{subAdmin.username}</span>
                      </h3>
                      <div className={styles.badgesRow}>
                        <span className={styles.userCountBadge}>
                          <FaUsers className={styles.badgeIcon} /> {subAdmin.userCount || 0} User{subAdmin.userCount === 1 ? '' : 's'}
                        </span>
                        <span className={styles.permCountBadge}>
                          <FaKey className={styles.badgeIcon} /> {activePermsCount}/{PERMISSION_CONFIG.length} Perms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardHeaderActions}>
                    <div 
                      className={`${styles.expandBtn} ${isExpanded ? styles.expandBtnActive : ''}`}
                      aria-label={isExpanded ? "Collapse Admin Master details" : "Expand Admin Master details and permissions"}
                    >
                      <span className={styles.expandBtnText}>
                        {isExpanded ? 'Hide Perms' : 'Permissions'}
                      </span>
                      {isExpanded ? (
                        <FaChevronUp className={styles.expandIcon} />
                      ) : (
                        <FaChevronDown className={styles.expandIcon} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Content - Default Collapsed, Shown only when isExpanded is true */}
                {isExpanded && (
                  <div className={styles.expandedSection}>
                    {/* Metadata and Delete Action */}
                    <div className={styles.adminMetaDetails}>
                      <div className={styles.metaRow}>
                        <span><strong>Email:</strong> {subAdmin.email}</span>
                        <span><strong>Phone:</strong> {subAdmin.phoneNumber}</span>
                        {subAdmin.agentCode && (
                          <span><strong>Agent Code:</strong> {subAdmin.agentCode}</span>
                        )}
                        <span><strong>Created:</strong> {new Date(subAdmin.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        type="button"
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubAdmin(adminId, subAdmin.username);
                        }}
                        title="Delete Admin Master"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>

                    {/* Permission Matrix Toggles */}
                    <div className={styles.permissionSection}>
                      <h4>
                        <span>Permissions Matrix ({activePermsCount} Enabled)</span>
                        <span className={styles.permNotice}>
                          Toggle switch to grant or revoke access instantly
                        </span>
                      </h4>
                      <div className={styles.permissionGrid}>
                        {PERMISSION_CONFIG.map(({ key, label }) => {
                          const isChecked = Boolean(perms[key]);
                          const updateKey = `${adminId}-${key}`;
                          const isUpdating = updatingPerms[updateKey];

                          return (
                            <div key={key} className={`${styles.permissionItem} ${isChecked ? styles.permissionItemChecked : ''}`}>
                              <span className={styles.permLabel}>{label}</span>
                              <label className={styles.switch}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  disabled={isUpdating}
                                  onChange={() => handleTogglePermission(adminId, key, isChecked)}
                                />
                                <span className={styles.slider}></span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Sub-Admin Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Register New Admin Master</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Username *</label>
                  <input 
                    type="text" 
                    placeholder="Unique username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Password *</label>
                  <input 
                    type="password" 
                    placeholder="Secret password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input 
                    type="text" 
                    placeholder="10-digit number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Agent Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AGENT001"
                    value={formData.agentCode}
                    onChange={(e) => setFormData({ ...formData, agentCode: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '10px' }}>
                  Initial Feature Permissions
                </label>
                <div className={styles.permissionGrid}>
                  {PERMISSION_CONFIG.map(({ key, label }) => (
                    <div key={key} className={styles.permissionItem}>
                      <span className={styles.permLabel}>{label}</span>
                      <label className={styles.switch}>
                        <input 
                          type="checkbox"
                          checked={formData.permissions[key]}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Create Admin Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
