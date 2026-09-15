import React, { useState, useRef } from "react";
import styles from "./WithdrawalPopup.module.css"; // Import CSS
import { Toast } from "primereact/toast"; // Import Toast component
import { useUser } from "../../../../context/UserContext";
import { getImageUrl } from "../../../../utils/imageUrl";

export default function WithdrawalPopup({
  onClose,
  walletBalance = 0,
  setWalletBalance,
  selectedId,
}) {
  const [withdrawalAmount, setWithdrawalAmount] = useState(""); // State for input amount
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const toast = useRef(null); // Add a reference for Toast
  const { user, url } = useUser();

  // Input Change Handler
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow only positive values or empty input
    if (parseFloat(value) >= 0 || value === "") {
      setWithdrawalAmount(value);
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage("Amount cannot be negative.");
    }
  };

  const handleWithdrawal = async () => {
    setErrorMessage(""); // Clear previous errors
  
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setErrorMessage("Please enter a valid withdrawal amount.");
      return;
    }
  
    // Prepare FormData
    const formData = new FormData();
    formData.append("amount", withdrawalAmount); // Withdrawal amount
    formData.append("createdAt", new Date().toISOString()); // Current timestamp
    formData.append("createdBy", user.id); // User ID (ensure `user` is available in your component)
    formData.append("websiteName", selectedId.websiteName); // Website name
    formData.append("websiteUrl", selectedId.websiteUrl); // Website URL
    formData.append("username", selectedId.username); // Username
    formData.append("status", selectedId.status); // Status
    formData.append("id", selectedId.username); // Unique ID of selected object
  
    try {
      // Make the POST request
        //   console.log([...formData.entries()]);

      const response = await fetch(
        `${url}/api/user/create-withdrawal-transaction`,
        {
          method: "POST",
          body: formData, // Send the FormData object
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to process withdrawal. Please try again.");
      }
  
      const result = await response.json(); // Assuming the API returns JSON data
      // Success toast message
      toast.current.show({
        severity: "success",
        summary: "Withdrawal Successful",
        detail: "Your withdrawal has been processed successfully.",
        life: 3000,
      });

      // Close the popup
      onClose();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      // Error toast message
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong. Please try again.",
        life: 3000,
      });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* Toast Component */}
        <Toast ref={toast} />

        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Image and User Info */}
        <div className={styles.initialView}>
          <img
            src={getImageUrl(selectedId.imgUrl, url)}
            alt="User"
            className={styles.depositImage}
          />
          <p className={styles.username}>{selectedId.username}</p>
          <p className={styles.idName}>{selectedId.websiteName}</p>
        </div>

        {/* Withdrawal Section */}
        <h2 className={styles.depositName}>Withdraw</h2>
        <div className={styles.balanceContainer}>
          <div className={styles.amount}>
            <strong>₹ {withdrawalAmount || "0.00"}</strong>
          </div>
          <p className={styles.wallet}>
            <strong>Wallet Balance: ₹ {walletBalance}</strong>
          </p>
        </div>

        {/* Input Field */}
        <div className={styles.inputSection}>
          <label className={styles.inputLabel}>
            <strong>Enter Withdrawal Amount:</strong>
          </label>
          <input
            type="number"
            className={styles.input}
            value={withdrawalAmount}
            onChange={handleInputChange}
            onWheel={(e) => e.target.blur()}
            placeholder="Enter withdrawal amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}

        {/* Submit Button */}
        <button className={styles.submitButton} onClick={handleWithdrawal}>
          <strong>Withdraw</strong>
        </button>
      </div>
    </div>
  );
}
