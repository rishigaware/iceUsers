import React, { useState, useRef, useEffect } from "react";
import styles from "./WalletWithdrawalPopup.module.css";
import { Toast } from "primereact/toast";
import { useUser } from "../../context/UserContext";

export default function WalletWithdrawalPopup({ onClose }) {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("upi");
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    upiId: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    bankName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useRef(null);
  const { user, url, refreshUserBalance } = useUser();

  // Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const availableBalance = parseFloat(user?.balance) || 0;

  // Input Change Handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (parseFloat(value) >= 0 || value === "") {
      setWithdrawalAmount(value);
      setErrorMessage("");
    } else {
      setErrorMessage("Amount cannot be negative.");
    }
  };

  // Withdrawal method change handler
  const handleMethodChange = (method) => {
    setWithdrawalMethod(method);
    setWithdrawalDetails({
      upiId: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
    });
  };

  // Withdrawal details change handler
 const handleDetailsChange = (field, value) => {
    setWithdrawalDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validation
  const validateWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setErrorMessage("Please enter a valid withdrawal amount.");
      return false;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount > availableBalance) {
      setErrorMessage(`Insufficient balance. You have ₹${availableBalance} available. Maximum withdrawal: ₹${availableBalance.toFixed(2)}`);
      return false;
    }

    if (withdrawalMethod === "upi") {
      if (!withdrawalDetails.upiId) {
        setErrorMessage("Please enter your UPI ID.");
        return false;
      }
    } else {
      if (!withdrawalDetails.accountNumber || !withdrawalDetails.accountHolderName || 
          !withdrawalDetails.ifscCode || !withdrawalDetails.bankName) {
        setErrorMessage("Please fill all bank details.");
        return false;
      }
    }

    return true;
  };

  const handleWithdrawal = async () => {
    setErrorMessage("");
    
    if (!validateWithdrawal()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(withdrawalAmount);
      
      const requestData = {
        userId: user.id,
        amount: amount,
        withdrawalMethod: withdrawalMethod,
        withdrawalDetails: JSON.stringify(withdrawalDetails),
        transactionType: "wallet_withdrawal",
        status: "Pending",
        description: `Wallet withdrawal request for ₹${amount}`,
        createdAt: new Date().toISOString(),
        createdBy: user.username, // Backend expects username
      };

      const response = await fetch(
        `${url}/api/user/create-wallet-withdrawal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process withdrawal. Please try again.");
      }

      await refreshUserBalance();
      
      toast.current.show({
        severity: "success",
        summary: "Withdrawal Request Submitted",
        detail: `Withdrawal request for ₹${amount} has been submitted successfully.`,
        life: 3000,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error during withdrawal:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Something went wrong. Please try again.",
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <Toast ref={toast} />

        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.walletInfo}>
            <h3>Wallet Withdrawal</h3>
            <p className={styles.walletBalance}>
              Available Balance: <strong>₹{availableBalance.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={styles.scrollableContent}>

        {/* Withdrawal Amount Section */}
        <div className={styles.amountSection}>
          <h3>Withdrawal Amount</h3>
          <div className={styles.inputGroup}>
            <label>Enter Amount (₹):</label>
            <input
              type="number"
              value={withdrawalAmount}
              onChange={handleInputChange}
              onWheel={(e) => e.target.blur()}
              placeholder="Enter withdrawal amount in rupees"
              min="0"
              step="0.01"
              className={styles.amountInput}
            />
          </div>
          
          {withdrawalAmount && (
            <div className={styles.conversionInfo}>
              <p>Withdrawal Amount: <strong>₹{parseFloat(withdrawalAmount).toFixed(2)}</strong></p>
              <p>Maximum Withdrawal: <strong>₹{availableBalance.toFixed(2)}</strong></p>
            </div>
          )}
        </div>

        {/* Withdrawal Method */}
        <div className={styles.methodSection}>
          <h3>Withdrawal Method</h3>
          <div className={styles.methodButtons}>
            <button
              className={`${styles.methodButton} ${withdrawalMethod === 'upi' ? styles.active : ''}`}
              onClick={() => handleMethodChange('upi')}
            >
              UPI
            </button>
            <button
              className={`${styles.methodButton} ${withdrawalMethod === 'bank' ? styles.active : ''}`}
              onClick={() => handleMethodChange('bank')}
            >
              Bank Transfer
            </button>
          </div>
        </div>

        {/* Withdrawal Details */}
        <div className={styles.detailsSection}>
          <h3>Withdrawal Details</h3>
          
          {withdrawalMethod === 'upi' ? (
            <div className={styles.inputGroup}>
              <label>UPI ID:</label>
              <input
                type="text"
                value={withdrawalDetails.upiId}
                onChange={(e) => handleDetailsChange('upiId', e.target.value)}
                placeholder="Enter your UPI ID (e.g., user@paytm)"
                className={styles.detailInput}
              />
            </div>
          ) : (
            <div className={styles.bankDetails}>
              <div className={styles.inputGroup}>
                <label>Account Holder Name:</label>
                <input
                  type="text"
                  value={withdrawalDetails.accountHolderName}
                  onChange={(e) => handleDetailsChange('accountHolderName', e.target.value)}
                  placeholder="Enter account holder name"
                  className={styles.detailInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Account Number:</label>
                <input
                  type="text"
                  value={withdrawalDetails.accountNumber}
                  onChange={(e) => handleDetailsChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  className={styles.detailInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>IFSC Code:</label>
                <input
                  type="text"
                  value={withdrawalDetails.ifscCode}
                  onChange={(e) => handleDetailsChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                  className={styles.detailInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Bank Name:</label>
                <input
                  type="text"
                  value={withdrawalDetails.bankName}
                  onChange={(e) => handleDetailsChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                  className={styles.detailInput}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        </div> {/* End of scrollable content */}

        {/* Submit Button */}
        <button 
          className={styles.submitButton} 
          onClick={handleWithdrawal}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
        </button>
      </div>
    </div>
  );
}
