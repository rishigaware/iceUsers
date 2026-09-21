import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaTelegramPlane, 
  FaFacebookF, 
  FaHeadset, 
  FaTimes,
  FaEdit,
  FaCheck,
  FaSpinner,
  FaUserShield,
  FaLock
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { SOCIAL_LINKS } from '../../utils/socialLinks';
import { checkIsAdmin, checkIsSuperAdmin, ROLES } from '../../utils/roles';
import { ROUTES } from '../../utils/routes';
import styles from './FloatingSocialWidget.module.css';

const SOCIAL_ITEMS_CONFIG = [
  {
    id: 'whatsapp-support',
    field: 'whatsappSupport',
    name: 'WhatsApp Support',
    icon: <FaWhatsapp />,
    defaultUrl: SOCIAL_LINKS.whatsappSupport,
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.15)',
    borderColor: 'rgba(37, 211, 102, 0.4)',
    glow: 'rgba(37, 211, 102, 0.4)'
  },
  {
    id: 'whatsapp-channel',
    field: 'whatsappChannel',
    name: 'WhatsApp Channel',
    icon: <FaWhatsapp />,
    defaultUrl: SOCIAL_LINKS.whatsappChannel,
    color: '#00b0ff',
    bgColor: 'rgba(0, 176, 255, 0.15)',
    borderColor: 'rgba(0, 176, 255, 0.4)',
    glow: 'rgba(0, 176, 255, 0.4)'
  },
  {
    id: 'telegram',
    field: 'telegram',
    name: 'Telegram Channel',
    icon: <FaTelegramPlane />,
    defaultUrl: SOCIAL_LINKS.telegram,
    color: '#0088cc',
    bgColor: 'rgba(0, 136, 204, 0.15)',
    borderColor: 'rgba(0, 136, 204, 0.4)',
    glow: 'rgba(0, 136, 204, 0.4)'
  },
  {
    id: 'instagram',
    field: 'instagram',
    name: 'Instagram',
    icon: <FaInstagram />,
    defaultUrl: SOCIAL_LINKS.instagram,
    color: '#E1306C',
    bgColor: 'rgba(225, 48, 108, 0.15)',
    borderColor: 'rgba(225, 48, 108, 0.4)',
    glow: 'rgba(225, 48, 108, 0.4)'
  },
  {
    id: 'facebook',
    field: 'facebook',
    name: 'Facebook',
    icon: <FaFacebookF />,
    defaultUrl: SOCIAL_LINKS.facebook,
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.15)',
    borderColor: 'rgba(24, 119, 242, 0.4)',
    glow: 'rgba(24, 119, 242, 0.4)'
  }
];

const FloatingSocialWidget = () => {
  const { user, url } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('superadmin'); // 'superadmin' | 'myLinks'
  const [supportData, setSupportData] = useState(null);
  const [selectedTargetAdminId, setSelectedTargetAdminId] = useState('superadmin');
  const [editingItem, setEditingItem] = useState(null);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const location = useLocation();
  const widgetRef = useRef(null);

  // Requirement: Hide if logged out (!user) or on login/signup pages
  const hiddenRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP];
  const isHidden = !user || hiddenRoutes.includes(location.pathname);

  // Fetch support links according to user or admin credentials
  const fetchLinks = async (targetAdmin = 'superadmin') => {
    if (!user) return;
    try {
      const headers = {};
      const isAdmin = checkIsAdmin(user);
      const isSuper = checkIsSuperAdmin(user);
      const identifier = user.id || user._id || user.username;

      if (isAdmin) {
        headers['x-admin-id'] = identifier;
        if (isSuper && targetAdmin) {
          headers['x-target-admin-id'] = targetAdmin;
        }
      } else {
        headers['x-user-id'] = identifier;
      }

      const queryParam = isSuper && targetAdmin ? `?targetAdminId=${targetAdmin}` : '';
      const res = await fetch(`${url}/api/support/links${queryParam}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSupportData(data);
        if (data.selectedTargetAdminId) {
          setSelectedTargetAdminId(data.selectedTargetAdminId);
        }
      }
    } catch (error) {
      console.error('Error fetching support links:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, url]);

  // Set default active tab depending on role
  useEffect(() => {
    if (checkIsSuperAdmin(supportData?.role)) {
      setActiveTab('myLinks');
    } else if (checkIsAdmin(supportData?.role)) {
      setActiveTab('superadmin');
    }
  }, [supportData?.role]);

  // Handle superadmin switching target admin to view/edit their links
  const handleTargetAdminChange = async (targetId) => {
    setSelectedTargetAdminId(targetId);
    await fetchLinks(targetId);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editingItem) {
          setEditingItem(null);
        } else {
          setIsOpen(false);
        }
      }
    };

    if (isOpen || editingItem) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, editingItem]);

  // Close speed dial if route changes
  useEffect(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, [location.pathname]);

  useEffect(() => {
    const computedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    console.log('[THEME DEBUG] Current computed --primary-color on root:', computedPrimary);
  }, []);

  if (isHidden) {
    return null;
  }

  // Toggle speed dial
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  // Determine current links to display
  const isSuperAdmin = checkIsSuperAdmin(supportData?.role);
  const isSubAdmin = supportData?.role?.toLowerCase() === ROLES.ADMIN;
  const hasSubAdminEditPermission = Boolean(supportData?.canEdit);

  let currentLinksMap = {};
  let showEditButton = false;

  if (isSuperAdmin) {
    currentLinksMap = supportData?.myLinks || supportData?.superadminLinks || {};
    showEditButton = true;
  } else if (isSubAdmin) {
    if (activeTab === 'superadmin') {
      currentLinksMap = supportData?.superadminLinks || {};
      showEditButton = false; // Subadmin contacting superadmin (read-only)
    } else {
      currentLinksMap = supportData?.myLinks || {};
      // Only show edit button if subadmin has permission granted by superadmin
      showEditButton = hasSubAdminEditPermission;
    }
  } else {
    // End-User (pure navigation, no edit buttons)
    currentLinksMap = supportData?.links || {};
    showEditButton = false;
  }

  // Open edit modal for an item
  const handleOpenEdit = (e, item, currentUrl) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setEditUrlInput(currentUrl || item.defaultUrl);
  };

  // Save updated link
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !user) return;

    setIsSaving(true);
    try {
      const identifier = user.id || user._id || user.username;
      const bodyPayload = {
        [editingItem.field]: editUrlInput.trim()
      };

      if (isSuperAdmin && selectedTargetAdminId && selectedTargetAdminId !== 'superadmin') {
        bodyPayload.targetAdminId = selectedTargetAdminId;
      }

      const res = await fetch(`${url}/api/support/links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': identifier
        },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setSupportData(prev => {
          if (!prev) return prev;
          if (isSuperAdmin) {
            const isEditingSub = selectedTargetAdminId && selectedTargetAdminId !== 'superadmin';
            return {
              ...prev,
              myLinks: { ...prev.myLinks, [editingItem.field]: editUrlInput.trim() },
              superadminLinks: isEditingSub 
                ? prev.superadminLinks 
                : { ...prev.superadminLinks, [editingItem.field]: editUrlInput.trim() }
            };
          }
          return {
            ...prev,
            myLinks: { ...prev.myLinks, [editingItem.field]: editUrlInput.trim() }
          };
        });

        const targetSub = isSuperAdmin && selectedTargetAdminId !== 'superadmin'
          ? (supportData?.subAdmins?.find(s => s.id === selectedTargetAdminId)?.username || 'Admin Master')
          : '';

        setToastMessage(targetSub 
          ? `${editingItem.name} updated for Admin Master ${targetSub}!` 
          : `${editingItem.name} link updated!`);
        setTimeout(() => setToastMessage(''), 3000);
        setEditingItem(null);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update support link. Please try again.');
      }
    } catch (err) {
      console.error('Error saving support link:', err);
      alert('Error updating support link.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get target admin name for superadmin modal info
  const selectedSubAdminObj = isSuperAdmin && selectedTargetAdminId !== 'superadmin'
    ? supportData?.subAdmins?.find(s => s.id === selectedTargetAdminId)
    : null;

  return (
    <div className={styles.floatingContainer} ref={widgetRef} aria-label="Social and Support Links">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <FaCheck className={styles.toastIcon} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop overlay for focus on open */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => {
            setIsOpen(false);
            setEditingItem(null);
          }} 
          aria-hidden="true" 
        />
      )}

      {/* Edit Modal Dialog */}
      {editingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <span className={styles.modalIcon} style={{ color: editingItem.color }}>
                  {editingItem.icon}
                </span>
                <div>
                  <h4 className={styles.modalTitle}>Edit {editingItem.name}</h4>
                  <p className={styles.modalSub}>
                    {isSuperAdmin
                      ? (selectedSubAdminObj 
                          ? `Editing for Admin Master: ${selectedSubAdminObj.name || selectedSubAdminObj.username} (${selectedSubAdminObj.username})` 
                          : 'Global Superadmin link (seen by all Admin Masters).')
                      : 'This link will be seen by all users assigned to you.'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setEditingItem(null)}
                aria-label="Close dialog"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="edit-url-input" className={styles.inputLabel}>
                  Destination URL:
                </label>
                <input
                  id="edit-url-input"
                  type="url"
                  required
                  placeholder="https://..."
                  className={styles.urlInput}
                  value={editUrlInput}
                  onChange={(e) => setEditUrlInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingItem(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className={styles.spinner} /> Saving...
                    </>
                  ) : (
                    'Save Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Menu List */}
      <div className={`${styles.menuList} ${isOpen ? styles.menuListOpen : ''}`}>
        
        {/* Superadmin Selector: Manage Superadmin Links or Any Sub-Admin Links */}
        {isSuperAdmin && (
          <div className={styles.adminSelectorContainer}>
            <div className={styles.adminSelectorLabel}>
              <FaUserShield className={styles.adminSelectorIcon} />
              <span>Target Admin:</span>
            </div>
            <select
              className={styles.adminSelect}
              value={selectedTargetAdminId}
              onChange={(e) => handleTargetAdminChange(e.target.value)}
              title="Select which admin's links to view or edit"
            >
              <option value="superadmin">👑 Superadmin (Global)</option>
              {(supportData?.subAdmins || []).map(sub => (
                <option key={sub.id} value={sub.id}>
                  👤 {sub.name || sub.username} (Admin Master)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sub-Admin Tab Switcher: "Superadmin Support" vs "My Support Links" */}
        {isSubAdmin && (
          <div className={styles.tabSwitcher}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'superadmin' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('superadmin')}
            >
              Superadmin
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'myLinks' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('myLinks')}
            >
              My Links
            </button>
          </div>
        )}

        {/* Sub-Admin Read-Only Notice if Permission is not granted */}
        {isSubAdmin && activeTab === 'myLinks' && !hasSubAdminEditPermission && (
          <div className={styles.readOnlyNotice}>
            <FaLock className={styles.readOnlyIcon} />
            <span>View Only (Admin Master Permission Required)</span>
          </div>
        )}

        {/* Speed Dial Items */}
        {SOCIAL_ITEMS_CONFIG.map((item, index) => {
          const itemUrl = currentLinksMap[item.field] || item.defaultUrl;

          return (
            <div key={item.id} className={styles.menuItemWrapper}>
              <a
                href={itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.menuItem}
                style={{
                  '--item-index': index,
                  '--item-color': item.color,
                  '--item-bg': item.bgColor,
                  '--item-border': item.borderColor,
                  '--item-glow': item.glow
                }}
                aria-label={item.name}
                title={item.name}
              >
                <span className={styles.itemLabel}>{item.name}</span>
                <div className={styles.iconCircle}>
                  {item.icon}
                </div>
              </a>

              {/* Edit Option below each social link for Superadmin & Authorized Sub-admin */}
              {showEditButton && (
                <div className={styles.editRow}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={(e) => handleOpenEdit(e, item, itemUrl)}
                    title={`Edit ${item.name} URL`}
                  >
                    <FaEdit className={styles.editIcon} />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Trigger Button (Identical styling with headset and pulsing rings) */}
      <button
        type="button"
        className={`${styles.triggerButton} ${isOpen ? styles.triggerButtonOpen : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close social media and support menu" : "Open social media and support menu"}
      >
        <span className={styles.pulseRing}></span>
        <span className={styles.pulseRingOuter}></span>
        
        <div className={styles.buttonIconWrapper}>
          <span className={`${styles.iconContainer} ${styles.iconLauncher} ${isOpen ? styles.iconHidden : styles.iconVisible}`}>
            <FaHeadset className={styles.launcherIcon} />
          </span>
          <span className={`${styles.iconContainer} ${styles.iconClose} ${isOpen ? styles.iconVisible : styles.iconHidden}`}>
            <FaTimes className={styles.closeIcon} />
          </span>
        </div>
      </button>
    </div>
  );
};

export default FloatingSocialWidget;
