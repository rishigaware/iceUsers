import React, { useState } from 'react';
import styles from './WithdrawalPopup.module.css';

const WithdrawalPopup = ({ isOpen, isClose, user }) => {
  const [formData, setFormData] = useState({
    amount: '',
    withdrawalMethod: 'upi',
    upiId: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) > (user?.balance || 0)) {
      setError('Insufficient wallet balance');
      return;
    }

    if (formData.withdrawalMethod === 'upi' && !formData.upiId) {
      setError('Please enter UPI ID');
      return;
    }

    if (formData.withdrawalMethod === 'bank' && (!formData.bankAccountNumber || !formData.bankName || !formData.ifscCode || !formData.accountHolderName)) {
      setError('Please fill all bank details');
      return;
    }

    setIsSubmitting(true);

    try {
      const withdrawalDetails = formData.withdrawalMethod === 'upi' 
        ? { upiId: formData.upiId }
        : {
            accountNumber: formData.bankAccountNumber,
            bankName: formData.bankName,
            ifscCode: formData.ifscCode,
            accountHolderName: formData.accountHolderName
          };

      const response = await fetch('http://localhost:5000/api/user/create-wallet-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          withdrawalMethod: formData.withdrawalMethod,
          withdrawalDetails: withdrawalDetails,
          createdAt: new Date().toISOString(),
          createdBy: user?.username || user?.email || 'Unknown'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Withdrawal request submitted successfully!');
        // Reset form
        setFormData({
          amount: '',
          withdrawalMethod: 'upi',
          upiId: '',
          bankAccountNumber: '',
          bankName: '',
          ifscCode: '',
          accountHolderName: ''
        });
        // Close popup after 2 seconds
        setTimeout(() => {
          isClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2>Withdrawal Request</h2>
          <button className={styles.closeButton} onClick={isClose}>×</button>
        </div>

        <div className={styles.balanceInfo}>
          <p>Available Balance: <span className={styles.balanceAmount}>₹{(parseFloat(user?.balance) || 0).toFixed(2)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount to withdraw"
              min="1"
              max={user?.balance || 0}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="withdrawalMethod">Withdrawal Method</label>
            <select
              id="withdrawalMethod"
              name="withdrawalMethod"
              value={formData.withdrawalMethod}
              onChange={handleInputChange}
              required
            >
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {formData.withdrawalMethod === 'upi' && (
            <div className={styles.formGroup}>
              <label htmlFor="upiId">UPI ID</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="Enter UPI ID (e.g., user@paytm)"
                required
              />
            </div>
          )}

          {formData.withdrawalMethod === 'bank' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="bankAccountNumber">Account Number</label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter bank account number"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bankName">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ifscCode">IFSC Code</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="accountHolderName">Account Holder Name</label>
                <input
                  type="text"
                  id="accountHolderName"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                  required
                />
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.buttonGroup}>
            <button type="button" onClick={isClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalPopup;
