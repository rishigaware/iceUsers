import { Toast } from "primereact/toast";
import React, { useState, useRef, useEffect } from "react";

import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";
import styles from "./WebsiteWithdrawalPopup.module.css";

export default function WebsiteWithdrawalPopup({ onClose, selectedId }) {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [coinRate, setCoinRate] = useState(1);
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

  // Set coin rate from ID data
  useEffect(() => {
    if (selectedId && selectedId.coinRate) {
      setCoinRate(parseFloat(selectedId.coinRate) || 1);
    }
  }, [selectedId]);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Calculate conversion
  const calculateCoinsNeeded = (rupees) => {
    return Math.ceil(rupees / coinRate);
  };

  const calculateRupeesFromCoins = (coins) => {
    return coins * coinRate;
  };

  const availableCoins = selectedId?.balance || 0;
  const maxWithdrawalRupees = calculateRupeesFromCoins(availableCoins);

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
    setWithdrawalDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validation
  const validateWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setErrorMessage("Please enter a valid withdrawal amount.");
      return false;
    }

    const coinsNeeded = calculateCoinsNeeded(parseFloat(withdrawalAmount));
    if (coinsNeeded > availableCoins) {
      setErrorMessage(
        `Insufficient coins. You have ${availableCoins} coins available. Maximum withdrawal: ₹${maxWithdrawalRupees.toFixed(2)}`,
      );
      return false;
    }

    if (withdrawalMethod === "upi") {
      if (!withdrawalDetails.upiId) {
        setErrorMessage("Please enter your UPI ID.");
        return false;
      }
    } else {
      if (
        !withdrawalDetails.accountNumber ||
        !withdrawalDetails.accountHolderName ||
        !withdrawalDetails.ifscCode ||
        !withdrawalDetails.bankName
      ) {
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
      const coinsNeeded = calculateCoinsNeeded(parseFloat(withdrawalAmount));

      const formData = new FormData();
      formData.append("amount", withdrawalAmount);
      formData.append("coinsNeeded", coinsNeeded);
      formData.append("coinRate", coinRate);
      formData.append("withdrawalMethod", withdrawalMethod);
      formData.append("withdrawalDetails", JSON.stringify(withdrawalDetails));
      formData.append("createdAt", new Date().toISOString());
      formData.append("createdBy", user.id);
      formData.append("websiteName", selectedId.websiteName);
      formData.append("websiteUrl", selectedId.websiteUrl);
      formData.append("username", selectedId.username);
      formData.append("status", selectedId.status);
      formData.append("id", selectedId.id);

      const response = await fetch(
        `${url}/api/user/create-withdrawal-transaction`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process withdrawal. Please try again.");
      }

      await refreshUserBalance();

      toast.current.show({
        severity: "success",
        summary: "Withdrawal Request Submitted",
        detail: `Withdrawal request for ₹${withdrawalAmount} (${coinsNeeded} coins) has been submitted successfully.`,
        life: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong. Please try again.",
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
          <img
            src={getImageUrl(selectedId.imgUrl, url)}
            alt="Website"
            className={styles.websiteImage}
          />
          <div className={styles.websiteInfo}>
            <h3>{selectedId.websiteName}</h3>
            <p className={styles.username}>Username: {selectedId.username}</p>
            <p className={styles.coinBalance}>
              Available Coins: <strong>{availableCoins} coins</strong>
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

          </div>

          {/* Withdrawal Method */}
          <div className={styles.methodSection}>
            <h3>Withdrawal Method</h3>
            <div className={styles.methodButtons}>
              <button
                className={`${styles.methodButton} ${withdrawalMethod === "upi" ? styles.active : ""}`}
                onClick={() => handleMethodChange("upi")}
              >
                UPI
              </button>
              <button
                className={`${styles.methodButton} ${withdrawalMethod === "bank" ? styles.active : ""}`}
                onClick={() => handleMethodChange("bank")}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          {/* Withdrawal Details */}
          <div className={styles.detailsSection}>
            <h3>Withdrawal Details</h3>

            {withdrawalMethod === "upi" ? (
              <div className={styles.inputGroup}>
                <label>UPI ID:</label>
                <input
                  type="text"
                  value={withdrawalDetails.upiId}
                  onChange={(e) => handleDetailsChange("upiId", e.target.value)}
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
                    onChange={(e) =>
                      handleDetailsChange("accountHolderName", e.target.value)
                    }
                    placeholder="Enter account holder name"
                    className={styles.detailInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Account Number:</label>
                  <input
                    type="text"
                    value={withdrawalDetails.accountNumber}
                    onChange={(e) =>
                      handleDetailsChange("accountNumber", e.target.value)
                    }
                    placeholder="Enter account number"
                    className={styles.detailInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>IFSC Code:</label>
                  <input
                    type="text"
                    value={withdrawalDetails.ifscCode}
                    onChange={(e) =>
                      handleDetailsChange("ifscCode", e.target.value)
                    }
                    placeholder="Enter IFSC code"
                    className={styles.detailInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Bank Name:</label>
                  <input
                    type="text"
                    value={withdrawalDetails.bankName}
                    onChange={(e) =>
                      handleDetailsChange("bankName", e.target.value)
                    }
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
        </div>{" "}
        {/* End of scrollable content */}
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
