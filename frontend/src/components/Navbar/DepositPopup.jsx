import React, { useState, useRef, useEffect } from "react";
import { FaCopy } from "react-icons/fa"; // Importing FontAwesome copy icon
import styles from "./DepositPopup.module.css";
import { FiX } from "react-icons/fi";
import { useUser } from "../../context/UserContext";
import LoginPopup from '../Login/LoginPopup';


import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-dark-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function DepositPopup({ onClose, walletBalance = 0, setWalletBalance }) {
  const { user, setUser, url, refreshUserBalance } = useUser();

  const [accountDetails, setAccountDetails] = useState(null); // Store account details
  const [isDetailedView, setIsDetailedView] = useState(false); // Toggle between views
  const [activeTab, setActiveTab] = useState("depositFunds"); // Toggle between tabs
  const [withdrawalAmount, setWithdrawalAmount] = useState(""); // State for withdrawal amount
  const [withdrawalMethod, setWithdrawalMethod] = useState(""); // State for withdrawal method
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    upiId: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    bankName: ""
  }); // State for withdrawal details
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [paymentMethod, setPaymentMethod] = useState(""); // State for payment method
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

  const toast = useRef(null); // Add a reference for Toast




  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]); // Refetch balance whenever the user changes

  // Prevent background scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);



  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch account details if user exists
  useEffect(() => {
    if (!user) {
      setIsModalOpen(true); // Open modal if no user exists
      return;
    }

    const fetchAccountDetails = async () => {
      try {
        const userId = user?.id || user?._id || '';
        const response = await fetch(`${url}/api/user/get-accountdetails-deposit${userId ? `?userId=${userId}` : ''}`);
        if (!response.ok) {
          throw new Error("Failed to fetch account details");
        }
        const data = await response.json();
        // console.log(data);
        setAccountDetails(data); // Store account details in state
      } catch (error) {
        console.error("Error fetching account details:", error);
        setAccountDetails(null); // Explicitly set to null on error
      }
    };

    fetchAccountDetails();
  }, [user]); // Only runs when the 'user' state changes


  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle deposit payment
  const handlePayment = () => {
    const deposit = parseFloat(depositAmount || 0);
    if (isNaN(deposit) || deposit < 100) {
      setErrorMessage(" ₹100 Minimum Deposite Amount."); // Set error message
      return;
    }
    // setWalletBalance((prev) => prev + deposit);
    setDepositAmount(deposit);
    setErrorMessage(""); // Clear error message
    setIsDetailedView(true); // Show detailed view
    // Show success toast message
  };

  // Handle input change and reset error message
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow only positive numbers, no negative signs, no operators
    if (/^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
      setErrorMessage(""); // Reset error message when input changes
    }
  };

  // Function to copy text to clipboard
  const handleCopy = (text) => {
    if (!text) {
      toast.current.show({ severity: "warn", summary: "Error", detail: "Nothing to copy", life: 1000 });
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.current.show({ severity: "info", summary: "Copied", detail: "Copied to clipboard", life: 1000 }))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  
  const onFileSelect = (e) => {
    try {
      if (e.files && e.files[0]) {
        const file = e.files[0];
        if (file.size > 1000000) {
          throw new Error('File is too large. Max size is 1MB.');
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        setFile(file);
        toast.current.show({
          severity: 'success',
          summary: 'File Selected',
          detail: 'File uploaded successfully',
          life: 1000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'File Upload Failed',
        detail: error.message,
        life: 1000,
      });
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form default submission
  
    // Validate if photo and payment method are selected
    if (!file) {
      toast.current.show({
        severity: "error",
        summary: "No File",
        detail: "Please upload a valid image file.",
        life: 1000,
      });
      return;
    }
  
    if (!paymentMethod) {
      toast.current.show({
        severity: "error",
        summary: "Payment Method Required",
        detail: "Please select a payment method.",
        life: 1000,
      });
      return;
    }
    // Create FormData object
    const formData = new FormData();
    formData.append("image", file); // Append the image file
    formData.append("amount", depositAmount); // Append other transaction data
    formData.append("createdAt", new Date().toISOString()); // Add current timestamp
    formData.append("createdBy", user.id); // Add user ID
    formData.append("paymentMethod", paymentMethod); // Add payment method
  
    try {
      const response = await fetch(`${url}/api/user/create-transaction`, {
        method: "POST",
        body: formData, // Send the FormData object
      });
  
      if (!response.ok) {
        throw new Error("Transaction failed");
      }
  
      const data = await response.json();
      console.log("Transaction created:", data);
  
      // Show success toast
      toast.current.show({
        severity: "success",
        summary: "Transaction Successful",
        detail: "Transaction was successfully created.",
        life: 1000,
      });
  
      // Refresh user balance after successful deposit
      await refreshUserBalance();
  
      // Optionally reset form or close modal
      onClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
  
      // Show error toast
      toast.current.show({
        severity: "error",
        summary: "Transaction Failed",
        detail: error.message,
        life: 1000,
      });
    }
  };

  // Handle withdrawal submission
  const handleWithdrawalSubmit = async () => {
    // Validate withdrawal amount
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.current.show({
        severity: "error",
        summary: "Invalid Amount",
        detail: "Please enter a valid withdrawal amount.",
        life: 3000,
      });
      return;
    }

    // Check if user has sufficient balance
    if (amount > (user?.balance || 0)) {
      toast.current.show({
        severity: "error",
        summary: "Insufficient Balance",
        detail: `You have ₹${(parseFloat(user?.balance) || 0).toFixed(2)} in your wallet. Cannot withdraw ₹${amount}.`,
        life: 3000,
      });
      return;
    }

    // Validate withdrawal details based on method
    if (withdrawalMethod === "upi" && !withdrawalDetails.upiId) {
      toast.current.show({
        severity: "error",
        summary: "UPI ID Required",
        detail: "Please enter your UPI ID.",
        life: 3000,
      });
      return;
    }

    if (withdrawalMethod === "bank") {
      const { accountNumber, accountHolderName, ifscCode, bankName } = withdrawalDetails;
      if (!accountNumber || !accountHolderName || !ifscCode || !bankName) {
        toast.current.show({
          severity: "error",
          summary: "Bank Details Required",
          detail: "Please fill in all bank details.",
          life: 3000,
        });
        return;
      }
    }

    try {
      const response = await fetch(`${url}/api/user/create-wallet-withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          withdrawalMethod: withdrawalMethod,
          withdrawalDetails: withdrawalDetails,
          createdAt: new Date().toISOString(),
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Withdrawal request failed");
      }

      const data = await response.json();
      console.log("Withdrawal request created:", data);

      // Show success toast
      toast.current.show({
        severity: "success",
        summary: "Withdrawal Request Submitted",
        detail: "Your withdrawal request has been submitted for approval.",
        life: 3000,
      });

      // Reset form
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      setWithdrawalDetails({
        upiId: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
        bankName: ""
      });

      // Close popup
      onClose();
    } catch (error) {
      console.error("Error creating withdrawal request:", error);

      // Show error toast
      toast.current.show({
        severity: "error",
        summary: "Withdrawal Failed",
        detail: error.message,
        life: 3000,
      });
    }
  };
  
  

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>

        <Toast ref={toast}></Toast> {/* Use the Toast component */}

        <div className={styles.scrollContent}>
          {/* Initial Deposit View */}
          {!isDetailedView ? (
            <div className={styles.initialView}>
              <h2 className={styles.depositName}>Deposit</h2>

              {/* Rectangular Container */}
              <div className={styles.balanceContainer}>
                {/* Deposit Amount */}
                <div className={styles.amount}>
                  <strong>₹ {depositAmount || "0.00"}</strong>
                </div>

                {/* Wallet Balance */}
                <p className={styles.wallet}>
                  <strong>Wallet Balance : ₹ {(parseFloat(user?.balance) || 0).toFixed(2)}</strong>
                </p>
              </div>

              {/* Input Section */}
              <div className={styles.inputSection}>
                <label className={styles.inputLabel}>
                  <strong>Enter Amount:</strong>
                </label>
                <input
                  type="number"
                  className={styles.input}
                  value={depositAmount}
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                  placeholder="Enter deposit amount"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Error Message */}
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

              {/* Submit Button */}
              <button className={styles.submitButton} onClick={handlePayment}>
                <strong>Make Payment</strong>
              </button>
            </div>
          ) : (
            // Detailed Deposit View
            <div className={styles.detailedView}>
              {depositAmount && (
                <div className={styles.amountDisplay}>
                  <strong>Pay ₹{depositAmount}</strong>
                </div>
              )}

              {/* Tab Buttons */}
              <div className={styles.tabButtons}>
                <button
                  className={`${styles.tabButton} ${activeTab === "depositFunds" ? styles.activeTab : ""
                    }`}
                  onClick={() => handleTabChange("depositFunds")}
                >
                  Deposit Funds
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "withdrawFunds" ? styles.activeTab : ""
                    }`}
                  onClick={() => handleTabChange("withdrawFunds")}
                >
                  Withdraw Funds
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "bankDetails" ? styles.activeTab : ""
                    }`}
                  onClick={() => handleTabChange("bankDetails")}
                >
                  Bank Details
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "upiDetails" ? styles.activeTab : ""
                    }`}
                  onClick={() => handleTabChange("upiDetails")}
                >
                  UPI ID
                </button>
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>

                {activeTab === "depositFunds" && (
                  <div className={styles.depositFunds}>
                    <h2>
                      <strong>Deposit Funds</strong>
                    </h2>
                    <p>Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.</p>
                  </div>
                )}

                {activeTab === "withdrawFunds" && (
                  <div className={styles.withdrawFunds}>
                    <h2>
                      <strong>Withdraw Funds</strong>
                    </h2>
                    <p>Withdraw money from your wallet to your bank account or UPI ID.</p>

                    {/* Withdrawal Amount Input */}
                    <div className={styles.inputSection}>
                      <label className={styles.inputLabel}>
                        <strong>Withdrawal Amount:</strong>
                      </label>
                      <input
                        type="number"
                        className={styles.input}
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Enter withdrawal amount"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Withdrawal Method Selection */}
                    <div className={styles.dropdownSection}>
                      <label className={styles.dropdownLabel}>
                        <strong>Withdrawal Method:</strong>
                        <select
                          className={styles.dropdown}
                          value={withdrawalMethod}
                          onChange={(e) => setWithdrawalMethod(e.target.value)}
                          required
                        >
                          <option value="">-- Select withdrawal method --</option>
                          <option value="upi">UPI</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </label>
                    </div>

                    {/* UPI Details */}
                    {withdrawalMethod === "upi" && (
                      <div className={styles.withdrawalDetails}>
                        <label className={styles.inputLabel}>
                          <strong>UPI ID:</strong>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={withdrawalDetails.upiId}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, upiId: e.target.value }))}
                          placeholder="Enter your UPI ID (e.g., user@paytm)"
                        />
                      </div>
                    )}

                    {/* Bank Details */}
                    {withdrawalMethod === "bank" && (
                      <div className={styles.withdrawalDetails}>
                        <label className={styles.inputLabel}>
                          <strong>Account Number:</strong>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={withdrawalDetails.accountNumber}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Enter account number"
                        />

                        <label className={styles.inputLabel}>
                          <strong>Account Holder Name:</strong>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={withdrawalDetails.accountHolderName}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                          placeholder="Enter account holder name"
                        />

                        <label className={styles.inputLabel}>
                          <strong>IFSC Code:</strong>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={withdrawalDetails.ifscCode}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                          placeholder="Enter IFSC code"
                        />

                        <label className={styles.inputLabel}>
                          <strong>Bank Name:</strong>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={withdrawalDetails.bankName}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Enter bank name"
                        />
                      </div>
                    )}

                    {/* Withdrawal Submit Button */}
                    <button
                      className={styles.submitButton}
                      onClick={handleWithdrawalSubmit}
                      disabled={!withdrawalAmount || !withdrawalMethod}
                    >
                      <strong>Request Withdrawal</strong>
                    </button>
                  </div>
                )}

                {activeTab === "bankDetails" && (
                  <div className={styles.bankDetails}>
                    <h2>
                      <strong>Bank Details</strong>
                    </h2>
                    {accountDetails ? (
                      <>
                        <p className={styles.copyContainer}>
                          <strong>Bank Name :</strong>&nbsp; {accountDetails.bankName || "N/A"}
                          <FaCopy onClick={() => handleCopy(accountDetails.bankName)} className={styles.copyIcon} />
                        </p>
                        <p className={styles.copyContainer}>
                          <strong>Account Holder Name :</strong>&nbsp; {accountDetails.accountHolderName || "N/A"}
                          <FaCopy onClick={() => handleCopy(accountDetails.accountHolderName)} className={styles.copyIcon} />
                        </p>
                        <p className={styles.copyContainer}>
                          <strong>Account Number :</strong>&nbsp; {accountDetails.accountNumber || "N/A"}
                          <FaCopy onClick={() => handleCopy(accountDetails.accountNumber)} className={styles.copyIcon} />
                        </p>
                        <p className={styles.copyContainer}>
                          <strong>IFSC Code :</strong>&nbsp; {accountDetails.ifscCode || "N/A"}
                          <FaCopy onClick={() => handleCopy(accountDetails.ifscCode)} className={styles.copyIcon} />
                        </p>
                      </>
                    ) : (
                      <p className={styles.errorMessage} style={{textAlign: 'center'}}>No bank details available at the moment.</p>
                    )}
                  </div>
                )}

                {activeTab === "upiDetails" && (
                  <div className={styles.upiDetails}>
                    <h2>
                      <strong>UPI ID</strong>
                    </h2>
                    {accountDetails ? (
                      <p className={styles.copyContainer}>
                        <strong>UPI ID : </strong>&nbsp;{accountDetails.upiId || "N/A"}
                        <FaCopy onClick={() => handleCopy(accountDetails.upiId)} className={styles.copyIcon} />
                      </p>
                    ) : (
                      <p className={styles.errorMessage} style={{textAlign: 'center'}}>No UPI details available at the moment.</p>
                    )}
                  </div>
                )}

                {/* Upload Payment Photo */}
                <div className={styles.uploadSection}>
                  <FileUpload
                    mode="basic"
                    name="image" // Adjust this based on your backend's expected field name
                    url="/api/upload"
                    accept="image/*"
                    maxFileSize={1000000}
                    onSelect={onFileSelect}
                  />
                </div>

                {/* Select Payment Method */}
                <div className={styles.dropdownSection}>
                  <label className={styles.dropdownLabel}>
                    <strong>Select Payment Method:</strong>
                    <select
                      className={styles.dropdown}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="">-- Select a payment method --</option>
                      <option value="imps">IMPS (Immediate Payment Service)</option>
                      <option value="gpay">Google Pay (GPay)</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="BHIM UPI">BHIM UPI</option>
                      <option value="paytm">Paytm</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="upi">UPI (Unified Payments Interface)</option>
                      <option value="emiDebit">EMI on Debit Card</option>
                      <option value="emiCredit">EMI on Credit Card</option>
                      <option value="upiAutopay">UPI Autopay</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                {/* Submit Button (After Make Payment) */}
                <button className={styles.submitButton} onClick={handleSubmit}>
                  <strong>Deposit</strong>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />

    </div>
  );
}
