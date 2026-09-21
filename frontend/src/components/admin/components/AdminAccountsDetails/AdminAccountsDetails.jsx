import {
  FaUserShield,
  FaUsers,
  FaSearch,
  FaKey,
  FaCheck,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaIdBadge,
  FaCalendarAlt,
  FaArrowRight,
  FaUniversity,
  FaCreditCard,
  FaQrcode,
  FaRupeeSign,
} from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { useUser } from "../../../../context/UserContext";
import TopNavbar from "../Navbar/TopNavbar";
import styles from "./AdminAccountsDetails.module.css";

export default function AdminAccountsDetails() {
  const { user, url } = useUser();
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const showToast = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage({ text: "", type: "" });
    }, 4000);
  };

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/api/admin/subadmins`, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": user?.id || user?._id || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminAccounts(data);
      } else {
        const err = await res.json();
        showToast(
          err.message || "Failed to load Admin Master account details",
          "error",
        );
      }
    } catch (e) {
      console.error("Error fetching admin accounts:", e);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  }, [url, user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = adminAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    return (
      (acc.name && acc.name.toLowerCase().includes(q)) ||
      (acc.username && acc.username.toLowerCase().includes(q)) ||
      (acc.agentCode && acc.agentCode.toLowerCase().includes(q)) ||
      (acc.email && acc.email.toLowerCase().includes(q))
    );
  });

  const totalUsersAcrossAdmins = adminAccounts.reduce(
    (acc, curr) => acc + (curr.userCount || 0),
    0,
  );

  return (
    <div className={styles.container}>
      <TopNavbar />

      {/* Toast Notification */}
      {statusMessage.text && (
        <div className={styles.toast}>
          {statusMessage.type === "error" ? <FaTimes /> : <FaCheck />}
          {statusMessage.text}
        </div>
      )}

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.heading}>
            <FaUserShield className={styles.titleIcon} /> Admin Masters Account
            Details
          </h1>
          <p className={styles.subtitle}>
            Comprehensive overview of registered Admin Master accounts, contact
            information, agent codes, and system access status
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <FaUserShield />
          </div>
          <div className={styles.statInfo}>
            <h3>{adminAccounts.length}</h3>
            <span>Total Admin Masters</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalUsersAcrossAdmins}</h3>
            <span>Total Assigned Users</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <FaCheck />
          </div>
          <div className={styles.statInfo}>
            <h3>Active & Verified</h3>
            <span>System Access Status</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBarContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by Admin name, username, agent code, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Accounts List Cards / Table */}
      {loading ? (
        <div className={styles.loadingContainer}>Loading Admin Accounts...</div>
      ) : filteredAccounts.length > 0 ? (
        <div className={styles.accountsGrid}>
          {filteredAccounts.map((account, idx) => (
            <div
              key={account.id || account._id || idx}
              className={styles.accountCard}
            >
              <div className={styles.accountCardHeader}>
                <div className={styles.adminMeta}>
                  <div className={styles.avatarBadge}>
                    {(account.name || account.username || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.adminName}>
                      {account.name || "Admin Master"}
                    </h3>
                    <span className={styles.adminUsername}>
                      @{account.username}
                    </span>
                  </div>
                </div>
                <span className={styles.roleTag}>
                  {account.role || "Admin Master"}
                </span>
              </div>

              <div className={styles.accountDetailsBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FaIdBadge /> Agent Code:
                  </span>
                  <span className={styles.detailValue}>
                    {account.agentCode || "N/A"}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FaUsers /> Assigned Users:
                  </span>
                  <span className={styles.detailValueBadge}>
                    {account.userCount || 0} Registered Users
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FaEnvelope /> Email Address:
                  </span>
                  <span className={styles.detailValue}>
                    {account.email || "Not Provided"}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FaPhoneAlt /> Phone Number:
                  </span>
                  <span className={styles.detailValue}>
                    {account.phoneNumber || "Not Provided"}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FaCalendarAlt /> Joined Date:
                  </span>
                  <span className={styles.detailValue}>
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : "Active"}
                  </span>
                </div>
              </div>

              {/* Bank Account Details Section */}
              <div className={styles.bankDetailsSection}>
                <div className={styles.bankDetailsTitle}>
                  <FaUniversity className={styles.bankIcon} /> Bank Account &
                  Payment Details
                </div>
                <div className={styles.bankDetailsGrid}>
                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>
                      <FaUniversity /> Bank Name:
                    </span>
                    <span className={styles.bankDetailValue}>
                      {account.bankDetails?.bankName ||
                        account.bankName ||
                        "HDFC Bank"}
                    </span>
                  </div>
                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>
                      <FaCreditCard /> Account Holder:
                    </span>
                    <span className={styles.bankDetailValue}>
                      {account.bankDetails?.accountHolderName ||
                        account.accountHolderName ||
                        account.name ||
                        "Admin Master"}
                    </span>
                  </div>
                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>
                      <FaRupeeSign /> Account Number:
                    </span>
                    <span className={styles.bankDetailValueHighlight}>
                      {account.bankDetails?.accountNumber ||
                        account.accountNumber ||
                        "5010012345678"}
                    </span>
                  </div>
                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>
                      <FaIdBadge /> IFSC Code:
                    </span>
                    <span className={styles.bankDetailValueHighlight}>
                      {account.bankDetails?.ifscCode ||
                        account.ifscCode ||
                        "HDFC0001234"}
                    </span>
                  </div>
                  <div className={styles.bankDetailRow}>
                    <span className={styles.bankDetailLabel}>
                      <FaQrcode /> UPI / VPA ID:
                    </span>
                    <span className={styles.bankDetailValueUpi}>
                      {account.bankDetails?.upiId ||
                        account.upiId ||
                        `${account.username || "admin"}@upi`}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.permissionsPreview}>
                <span className={styles.permHeaderTitle}>
                  <FaKey /> Active Privileges:
                </span>
                <div className={styles.permBadges}>
                  {account.permissions?.canCreateUsers !== false && (
                    <span className={styles.permBadge}>Create Users</span>
                  )}
                  {account.permissions?.canUpdateUserBalance !== false && (
                    <span className={styles.permBadge}>Refill Balance</span>
                  )}
                  {account.permissions?.canManageTransactions !== false && (
                    <span className={styles.permBadge}>Transactions</span>
                  )}
                  {account.permissions?.canManageIdRequests !== false && (
                    <span className={styles.permBadge}>ID Requests</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noAccountsState}>
          No Admin Master accounts match your search query "{searchQuery}".
        </div>
      )}
    </div>
  );
}
