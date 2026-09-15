import React, { useState } from 'react';
import styles from './ChangePasswordModal.module.css';
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const ChangePasswordModal = ({ isOpen, onClose, idData }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { user, url } = useUser();
  const toast = useRef(null);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for password change';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || !idData) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'User or ID data not available',
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${url}/api/user/request-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idData.id,
          createdBy: user.username,
          newPassword: newPassword.trim(),
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Password change request submitted successfully',
          life: 3000,
        });
        
        // Reset form and close modal
        setNewPassword('');
        setConfirmPassword('');
        setReason('');
        setErrors({});
        onClose();
      } else {
        throw new Error(data.message || 'Failed to submit password change request');
      }
    } catch (error) {
      console.error('Error submitting password change request:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to submit password change request',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setReason('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Toast ref={toast} />
        
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <img
              src={getImageUrl(idData?.imgUrl, url)}
              alt={`${idData?.websiteName} logo`}
              className={styles.websiteLogo}
            />
            <div className={styles.websiteInfo}>
              <h2>Change Password</h2>
              <p className={styles.websiteName}>{idData?.websiteName}</p>
              <p className={styles.username}>Username: {idData?.username}</p>
            </div>
          </div>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🔒</span>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                placeholder="Enter new password"
                disabled={loading}
              />
              {errors.newPassword && (
                <span className={styles.errorText}>{errors.newPassword}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🔐</span>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm new password"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📝</span>
                Reason for Change
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${styles.textarea} ${errors.reason ? styles.inputError : ''}`}
                placeholder="Please provide a reason for changing the password..."
                rows={3}
                disabled={loading}
              />
              {errors.reason && (
                <span className={styles.errorText}>{errors.reason}</span>
              )}
            </div>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                <strong>Note:</strong> Your password change request will be reviewed by our team. 
                You will be notified once the change is approved and implemented.
              </p>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
