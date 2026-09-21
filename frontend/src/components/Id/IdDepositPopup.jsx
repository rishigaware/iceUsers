import React, { useState, useRef, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import styles from "./IdDepositPopup.module.css";
import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-dark-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function IdDepositPopup({ onClose, walletBalance = 0, setWalletBalance, selectedId }) {
  const { user, url, refreshUserBalance } = useUser();

  const [isDetailedView, setIsDetailedView] = useState(false);
  const [activeTab, setActiveTab] = useState("depositFunds");
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [file, setFile] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePayment = () => {
    const deposit = parseFloat(depositAmount || 0);
    if (isNaN(deposit) || deposit < 100) {
      setErrorMessage(" ₹100 Minimum Deposit Amount.");
      return;
    }
    setDepositAmount(deposit);
    setErrorMessage("");
    setIsDetailedView(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
      setErrorMessage("");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.current?.show({ severity: "info", summary: "Copied", detail: "Copied to clipboard", life: 1000 }))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const onFileSelect = (e) => {
    try {
      if (e.files && e.files[0]) {
        const selectedFile = e.files[0];
        if (selectedFile.size > 1000000) {
          throw new Error('File is too large. Max size is 1MB.');
        }
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        setFile(selectedFile);
        toast.current?.show({
          severity: 'success',
          summary: 'File Selected',
          detail: 'File uploaded successfully',
          life: 1000,
        });
      } else {
        throw new Error('No file selected.');
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'File Upload Failed',
        detail: error.message,
        life: 3000,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.current?.show({
        severity: "error",
        summary: "No File",
        detail: "Please upload a valid image file.",
        life: 3000,
      });
      return;
    }

    if (!paymentMethod) {
      toast.current?.show({
        severity: "error",
        summary: "Payment Method Required",
        detail: "Please select a payment method.",
        life: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("amount", depositAmount);
    formData.append("createdAt", new Date().toISOString());
    formData.append("createdBy", user?.username || user?.name || "User");
    formData.append("paymentMethod", paymentMethod);

    if (selectedId) {
      formData.append("websiteName", selectedId.websiteName || "");
      formData.append("websiteUrl", selectedId.websiteUrl || "");
      formData.append("username", selectedId.username || "");
      formData.append("password", selectedId.password || "");
      formData.append("status", selectedId.status || "active");
      if (selectedId.createdAt?._seconds) {
        formData.append("createdAtSelectedId", selectedId.createdAt._seconds);
      }
      formData.append("id", selectedId.id || selectedId._id || selectedId.username || "");
    }

    try {
      const response = await fetch(`${url}/api/user/create-transaction-id`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transaction failed");
      }

      toast.current?.show({
        severity: "success",
        summary: "Transaction Successful",
        detail: "Transaction was successfully created.",
        life: 3000,
      });

      await refreshUserBalance();
      onClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.current?.show({
        severity: "error",
        summary: "Transaction Failed",
        detail: error.message,
        life: 3000,
      });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <Toast ref={toast} />

        {!isDetailedView ? (
          <div className={styles.initialView}>
            {selectedId?.imgUrl && (
              <img
                src={getImageUrl(selectedId.imgUrl, url)}
                alt="Deposit Icon"
                className={styles.depositImage}
              />
            )}
            <p className={styles.username}>{selectedId?.username}</p>
            <p className={styles.idName}>{selectedId?.websiteName}</p>

            <h2 className={styles.depositName}>Deposit</h2>

            <div className={styles.balanceContainer}>
              <div className={styles.amount}>
                <strong>₹ {depositAmount || "0.00"}</strong>
              </div>

              <p className={styles.wallet}>
                <strong>Wallet Balance : ₹ {(parseFloat(user?.balance) || 0).toFixed(2)}</strong>
              </p>
            </div>

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

            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

            <button className={styles.submitButton} onClick={handlePayment}>
              <strong>Make Payment</strong>
            </button>
          </div>
        ) : (
          <div className={styles.detailedView}>
            {depositAmount && (
              <div className={styles.amountDisplay}>
                <strong>Pay ₹{depositAmount}</strong>
              </div>
            )}

            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "depositFunds" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("depositFunds")}
              >
                Deposit Funds
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "bankDetails" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("bankDetails")}
              >
                Bank Details
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "upiDetails" ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange("upiDetails")}
              >
                UPI ID
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "depositFunds" && (
                <div className={styles.depositFunds}>
                  <h2>
                    <strong>Deposit Funds</strong>
                  </h2>
                  <p>Deposit money only in the below available accounts to get the fastest credits and avoid possible delays.</p>
                </div>
              )}

              {activeTab === "bankDetails" && (
                <div className={styles.bankDetails}>
                  <h2>
                    <strong>Bank Details</strong>
                  </h2>
                  <p className={styles.copyContainer}>
                    <strong>Bank Name :</strong>&nbsp; Axis Bank
                    <FaCopy onClick={() => handleCopy("Axis Bank")} className={styles.copyIcon} />
                  </p>
                  <p className={styles.copyContainer}>
                    <strong>Account Holder Name :</strong>&nbsp; ABC
                    <FaCopy onClick={() => handleCopy("ABC")} className={styles.copyIcon} />
                  </p>
                  <p className={styles.copyContainer}>
                    <strong>Account Number :</strong>&nbsp; 123456789
                    <FaCopy onClick={() => handleCopy("123456789")} className={styles.copyIcon} />
                  </p>
                  <p className={styles.copyContainer}>
                    <strong>IFSC Code :</strong>&nbsp; ABCD12345
                    <FaCopy onClick={() => handleCopy("ABCD12345")} className={styles.copyIcon} />
                  </p>
                </div>
              )}

              {activeTab === "upiDetails" && (
                <div className={styles.upiDetails}>
                  <p className={styles.copyContainer}>
                    <strong>UPI ID : </strong>&nbsp; yourapp@upi
                    <FaCopy onClick={() => handleCopy("yourapp@upi")} className={styles.copyIcon} />
                  </p>
                </div>
              )}

              <div className={styles.uploadSection}>
                <FileUpload
                  mode="basic"
                  name="image"
                  url="/api/upload"
                  accept="image/*"
                  maxFileSize={1000000}
                  onSelect={onFileSelect}
                />
              </div>

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

              <button className={styles.submitButton} onClick={handleSubmit}>
                <strong>Deposit</strong>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
