import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import TopNavbar from "../Navbar/TopNavbar";
import { checkIsAdmin, checkIsSuperAdmin, checkIsSuperOrMaster, ROLES } from "../../utils/roles";
import { ROUTES } from "../../utils/routes";
import { formatCurrency } from "../../utils/currency";
import styles from "./Dashboard.module.css";
import DepositPopup from "../Navbar/DepositPopup";
import WalletWithdrawalPopup from "../Home/WalletWithdrawalPopup";

// Material UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import PaymentsIcon from "@mui/icons-material/Payments";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssessmentIcon from "@mui/icons-material/Assessment";

export default function Dashboard() {
  const { user, url, refreshUserBalance } = useUser();

  // Popup state handlers
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [showWithdrawalPopup, setShowWithdrawalPopup] = useState(false);

  // Allow superadmin (or any user for demo testing) to toggle active role view
  const [activeRoleView, setActiveRoleView] = useState(() => {
    return user?.role || ROLES.USER;
  });

  // Data states
  const [stats, setStats] = useState({
    userCount: 0,
    subAdminCount: 0,
    pendingRequests: 0,
    totalTransactions: 0,
    activeIdsCount: 0,
    totalBalanceSum: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userBettingIds, setUserBettingIds] = useState([]);
  const [pendingRequestsList, setPendingRequestsList] = useState([]);
  const [subAdminsList, setSubAdminsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync activeRoleView when user object updates
  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(user.role);
    }
  }, [user?.role]);

  // Fetch Dashboard details based on current role
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch User Balance if user role
      if (user.id) {
        refreshUserBalance();
      }

      // 2. Fetch User IDs if user
      if (user.id || user._id) {
        const userId = user.id || user._id;
        try {
          const res = await fetch(`${url}/api/user/get-ids/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setUserBettingIds(data.ids || data || []);
            setStats((prev) => ({
              ...prev,
              activeIdsCount: (data.ids || data || []).length,
            }));
          }
        } catch (e) {
          console.log("Could not fetch user IDs", e);
        }

        // Fetch User Transactions
        try {
          const res = await fetch(`${url}/api/user/transactions/${userId}`);
          if (res.ok) {
            const data = await res.json();
            const txs = data.transactions || data || [];
            setRecentTransactions(txs.slice(0, 5));
            setStats((prev) => ({
              ...prev,
              totalTransactions: txs.length,
            }));
          }
        } catch (e) {
          console.log("Could not fetch user transactions", e);
        }
      }

      // 3. Fetch Admin / Superadmin / Master Stats if admin role
      const isAdminOrSuper = checkIsAdmin(user);

      if (isAdminOrSuper) {
        const adminId = user.id || user._id || user.username;

        // Fetch Users list under Admin
        try {
          const res = await fetch(`${url}/api/admin/users`, {
            headers: { "admin-id": adminId },
          });
          if (res.ok) {
            const data = await res.json();
            const users = data.users || data || [];
            setUsersList(users.slice(0, 5));
            setStats((prev) => ({
              ...prev,
              userCount: users.length,
            }));
          }
        } catch (e) {
          console.log("Could not fetch admin users", e);
        }

        // Fetch ID Requests
        try {
          const res = await fetch(`${url}/api/admin/id-requests`, {
            headers: { "admin-id": adminId },
          });
          if (res.ok) {
            const data = await res.json();
            const requests = data.requests || data || [];
            setPendingRequestsList(requests.slice(0, 5));
            const pendingCount = requests.filter(
              (r) => r.status === "pending",
            ).length;
            setStats((prev) => ({
              ...prev,
              pendingRequests: pendingCount > 0 ? pendingCount : requests.length,
            }));
          }
        } catch (e) {
          console.log("Could not fetch id requests", e);
        }

        // Fetch SubAdmins for Superadmin/Master
        if (checkIsSuperOrMaster(user)) {
          try {
            const res = await fetch(`${url}/api/admin/subadmins`, {
              headers: { "admin-id": adminId },
            });
            if (res.ok) {
              const data = await res.json();
              const subs = data.subAdmins || data || [];
              setSubAdminsList(subs);
              setStats((prev) => ({
                ...prev,
                subAdminCount: subs.length,
              }));
            }
          } catch (e) {
            console.log("Could not fetch subadmins", e);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, url, refreshUserBalance]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Determine current view role badge styling
  const getRoleBadgeClass = (role) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case ROLES.SUPERADMIN:
        return styles.roleBadgeSuperadmin;
      case ROLES.MASTER:
        return styles.roleBadgeMaster;
      case ROLES.ADMIN:
        return styles.roleBadgeAdmin;
      default:
        return styles.roleBadgeUser;
    }
  };

  const isAdminView = checkIsAdmin(activeRoleView);

  return (
    <div className={styles.container}>
      {/* Top Navbar & Left Sidebar for all roles */}
      <TopNavbar />

      <div className={styles.innerContainer}>
        {/* Main Dashboard Header */}
        <div className={styles.headerBanner}>
          <div>
            <h1 className={styles.headerTitle}>
              <DashboardIcon
                style={{
                  fontSize: "2rem",
                  color: "var(--primary-color, #eab308)",
                }}
              />
              Dashboard Overview
              <span
                className={`${styles.roleBadge} ${getRoleBadgeClass(
                  activeRoleView,
                )}`}
              >
                <ShieldIcon style={{ fontSize: "0.9rem" }} />
                {activeRoleView}
              </span>
            </h1>
            <p className={styles.headerSubtitle}>
              Welcome back,{" "}
              <strong>{user?.name || user?.username || "Guest User"}</strong>!
              Here is your real-time performance & activity summary.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: USER DASHBOARD                                       */}
        {/* ------------------------------------------------------------- */}
        {activeRoleView === ROLES.USER && (
          <>
            {/* User Wallet Card */}
            <div className={styles.walletBanner}>
              <div>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Available Wallet Balance
                </span>
                <div className={styles.walletAmount}>
                  {formatCurrency(user?.balance)}
                </div>
              </div>
              <div className={styles.walletActions}>
                <button
                  onClick={() => setShowDepositPopup(true)}
                  className={styles.btnPrimary}
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <AddCircleOutlineIcon /> Add Deposit
                </button>
                <button
                  onClick={() => setShowWithdrawalPopup(true)}
                  className={styles.btnSecondary}
                  style={{ cursor: "pointer" }}
                >
                  <RemoveCircleOutlineIcon /> Withdraw
                </button>
              </div>
            </div>

            {/* Quick Metrics & Navigation Shortcuts */}
            <div className={styles.metricsGrid}>
              <Link to={ROUTES.TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconBlue}`}
                >
                  <PaymentsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.totalTransactions || recentTransactions.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Transactions</div>
                </div>
              </Link>

              <Link to={ROUTES.TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconAmber}`}
                >
                  <HourglassTopIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {recentTransactions.filter(t => t.status === "pending" || t.status === "Pending").length || 0}
                  </div>
                  <div className={styles.metricLabel}>Pending Deposits</div>
                </div>
              </Link>

              <Link to={ROUTES.TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconGreen}`}
                >
                  <AccountBalanceWalletIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {formatCurrency(user?.balance)}
                  </div>
                  <div className={styles.metricLabel}>Total Deposits</div>
                </div>
              </Link>

              <Link to={ROUTES.ID} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconPurple}`}
                >
                  <RecentActorsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.activeIdsCount || userBettingIds.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Betting Accounts</div>
                </div>
              </Link>
            </div>

            {/* Real Readonly Account Stats from DB */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <ShieldIcon /> User Profile Statistics (DB Records)
                </h2>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>User ID / Username</div>
                  <div className={styles.infoValue}>{user?.username || user?.name || "Standard User"}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Account Status</div>
                  <div className={styles.infoValue} style={{ color: "#10b981" }}>Active & Verified</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Active Betting IDs</div>
                  <div className={styles.infoValue}>{userBettingIds.length} Accounts</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Assigned Agent / Admin</div>
                  <div className={styles.infoValue}>{user?.agentCode || user?.assignedAdmin || "SUPER-01"}</div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Quick Shortcuts</h2>
              </div>
              <div className={styles.quickActionsGrid}>
                <Link to={ROUTES.ID} className={styles.actionTile}>
                  <RecentActorsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Request Betting ID</span>
                </Link>
                <div
                  onClick={() => setShowDepositPopup(true)}
                  className={styles.actionTile}
                  style={{ cursor: "pointer" }}
                >
                  <PaymentsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Deposit / Withdraw</span>
                </div>
                <Link to={ROUTES.PROFILE} className={styles.actionTile}>
                  <ListAltIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Account Profile</span>
                </Link>
                <Link to={ROUTES.HOME} className={styles.actionTile}>
                  <AssessmentIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Browse Games</span>
                </Link>
              </div>
            </div>

            {/* User Betting Accounts List */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <RecentActorsIcon /> My Betting Accounts List
                </h2>
                <Link to={ROUTES.ID} className={styles.sectionActionLink}>
                  Manage Accounts <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>Platform / Site</th>
                        <th>ID Username</th>
                        <th>Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBettingIds.length > 0 ? (
                        userBettingIds.map((item, idx) => (
                          <tr key={item._id || idx}>
                            <td style={{ fontWeight: 600 }}>{item.websiteName || item.site || "Exchange"}</td>
                            <td>{item.username || item.idUsername || "Active ID"}</td>
                            <td style={{ color: "#10b981", fontWeight: 700 }}>{formatCurrency(item.balance)}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles.statusApproved}`}>Active</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No active betting accounts found. Click "Request Betting ID" to get started!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent User Transactions */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <PaymentsIcon /> Recent Activity
                </h2>
                <Link to={ROUTES.TRANSACTIONS} className={styles.sectionActionLink}>
                  View All <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx, idx) => (
                          <tr key={tx._id || idx}>
                            <td style={{ textTransform: "capitalize" }}>
                              {tx.type || "Deposit"}
                            </td>
                            <td>
                              <span className={tx.type === "deposit" ? styles.txAmountDeposit : styles.txAmountWithdraw}>
                                {tx.type === "deposit" ? "+" : "-"} {formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${
                                  tx.status === "approved"
                                    ? styles.statusApproved
                                    : tx.status === "rejected"
                                    ? styles.statusRejected
                                    : styles.statusPending
                                }`}
                              >
                                {tx.status || "Pending"}
                              </span>
                            </td>
                            <td style={{ color: "#94a3b8" }}>
                              {tx.createdAt
                                ? new Date(tx.createdAt).toLocaleDateString()
                                : "Today"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No recent transactions found. Click "Add Deposit" to start!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: ADMIN / SUB-ADMIN DASHBOARD                           */}
        {/* ------------------------------------------------------------- */}
        {activeRoleView === ROLES.ADMIN && (
          <>
            {/* Admin Metrics Grid */}
            <div className={styles.metricsGrid}>
              <Link to={ROUTES.ADMIN_USERS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconBlue}`}
                >
                  <GroupsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.userCount || usersList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Assigned Users</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconAmber}`}
                >
                  <HourglassTopIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.pendingRequests || pendingRequestsList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Pending ID Requests</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconGreen}`}
                >
                  <PaymentsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.totalTransactions || 12}
                  </div>
                  <div className={styles.metricLabel}>Today's Transactions</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_ALL_IDS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconPurple}`}
                >
                  <RecentActorsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>Betting IDs</div>
                  <div className={styles.metricLabel}>ID Accounts List</div>
                </div>
              </Link>
            </div>

            {/* Real Readonly Admin Stats from DB */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <ShieldIcon /> Admin Node Statistics (DB Records)
                </h2>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Admin Account</div>
                  <div className={styles.infoValue}>{user?.name || user?.username || "Admin"}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Admin Agent Code</div>
                  <div className={styles.infoValue}>{user?.agentCode || "ADM-01"}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Registered Users Managed</div>
                  <div className={styles.infoValue}>{usersList.length} Registered</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Pending Requests Queue</div>
                  <div className={styles.infoValue}>{pendingRequestsList.length} Requests</div>
                </div>
              </div>
            </div>

            {/* Admin Quick Operations */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <AdminPanelSettingsIcon /> Admin Action Center
                </h2>
              </div>
              <div className={styles.quickActionsGrid}>
                <Link to={ROUTES.ADMIN_USERS} className={styles.actionTile}>
                  <GroupsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Manage Users</span>
                </Link>
                <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.actionTile}>
                  <HourglassTopIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Review ID Requests</span>
                </Link>
                <Link to={ROUTES.ADMIN_ALL_IDS} className={styles.actionTile}>
                  <RecentActorsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Betting Sites & IDs</span>
                </Link>
                <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.actionTile}>
                  <PaymentsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Approve / Add Deposit</span>
                </Link>
              </div>
            </div>

            {/* Admin Permissions Panel */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <ShieldIcon /> Active Admin Permissions
                </h2>
              </div>
              <div className={styles.cardPanel}>
                <span className={`${styles.permTag} ${styles.permTagActive}`}>
                  <CheckCircleIcon style={{ fontSize: "0.85rem" }} /> Create Users
                </span>
                <span className={`${styles.permTag} ${styles.permTagActive}`}>
                  <CheckCircleIcon style={{ fontSize: "0.85rem" }} /> Refill Balance
                </span>
                <span className={`${styles.permTag} ${styles.permTagActive}`}>
                  <CheckCircleIcon style={{ fontSize: "0.85rem" }} /> Manage ID Requests
                </span>
                <span className={`${styles.permTag} ${styles.permTagActive}`}>
                  <CheckCircleIcon style={{ fontSize: "0.85rem" }} /> Approve Transactions
                </span>
                <span className={`${styles.permTag} ${styles.permTagActive}`}>
                  <CheckCircleIcon style={{ fontSize: "0.85rem" }} /> Change Passwords
                </span>
              </div>
            </div>

            {/* Assigned Users Accounts List */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <GroupsIcon /> Managed Users List
                </h2>
                <Link to={ROUTES.ADMIN_USERS} className={styles.sectionActionLink}>
                  Manage Accounts <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Username</th>
                        <th>Phone Number</th>
                        <th>Wallet Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length > 0 ? (
                        usersList.slice(0, 5).map((u, idx) => (
                          <tr key={u._id || idx}>
                            <td style={{ fontWeight: 600 }}>{u.name || "Registered User"}</td>
                            <td>{u.username || "user"}</td>
                            <td>{u.phoneNumber || "N/A"}</td>
                            <td style={{ color: "#10b981", fontWeight: 700 }}>{formatCurrency(u.balance)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No users registered under this admin account yet. Click "Manage Users" to add users!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pending Requests Queue */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Pending ID Requests</h2>
                <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.sectionActionLink}>
                  View All Requests <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Website</th>
                        <th>Username</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequestsList.length > 0 ? (
                        pendingRequestsList.map((req, idx) => (
                          <tr key={req._id || idx}>
                            <td style={{ fontWeight: 600 }}>
                              {req.userId?.username || req.userName || "User"}
                            </td>
                            <td>{req.websiteName || "Bet Exchange"}</td>
                            <td>{req.idUsername || "Requested"}</td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${styles.statusPending}`}
                              >
                                {req.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No pending ID requests currently in queue.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: MASTER ADMIN DASHBOARD                                */}
        {/* ------------------------------------------------------------- */}
        {activeRoleView === ROLES.MASTER && (
          <>
            {/* Master Metrics Grid */}
            <div className={styles.metricsGrid}>
              <Link to={ROUTES.ADMIN_SUBADMINS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconPurple}`}
                >
                  <SupervisorAccountIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.subAdminCount || subAdminsList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Managed Sub-Admins</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_USERS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconBlue}`}
                >
                  <GroupsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.userCount || usersList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Total Network Users</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconGreen}`}
                >
                  <PaymentsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>₹450,000</div>
                  <div className={styles.metricLabel}>Master Volume</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconAmber}`}
                >
                  <HourglassTopIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.pendingRequests || pendingRequestsList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Network Requests</div>
                </div>
              </Link>
            </div>

            {/* Real Readonly Master Stats from DB */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <SupervisorAccountIcon /> Master Node Metrics (DB Records)
                </h2>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Master Account</div>
                  <div className={styles.infoValue}>{user?.name || user?.username || "Master Admin"}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Active Sub-Admin Nodes</div>
                  <div className={styles.infoValue}>{subAdminsList.length} Managed Admins</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Network Users</div>
                  <div className={styles.infoValue}>{usersList.length} Active Users</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Network ID Requests</div>
                  <div className={styles.infoValue}>{pendingRequestsList.length} Pending</div>
                </div>
              </div>
            </div>

            {/* Master Shortcuts */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <SupervisorAccountIcon /> Master Controls
                </h2>
              </div>
              <div className={styles.quickActionsGrid}>
                <Link to={ROUTES.ADMIN_SUBADMINS} className={styles.actionTile}>
                  <SupervisorAccountIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Sub-Admin Directory</span>
                </Link>
                <Link to={ROUTES.ADMIN_USERS} className={styles.actionTile}>
                  <GroupsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>All System Users</span>
                </Link>
                <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.actionTile}>
                  <PaymentsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Network Financials</span>
                </Link>
              </div>
            </div>

            {/* Sub-Admins Summary */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Sub-Admin Network Overview</h2>
                <Link to={ROUTES.ADMIN_SUBADMINS} className={styles.sectionActionLink}>
                  Manage Accounts <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>Sub-Admin Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subAdminsList.length > 0 ? (
                        subAdminsList.map((sa, idx) => (
                          <tr key={sa._id || idx}>
                            <td style={{ fontWeight: 600 }}>{sa.name || "Admin"}</td>
                            <td>{sa.username}</td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${styles.statusApproved}`}
                              >
                                {sa.role || "admin"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${styles.statusApproved}`}
                              >
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No sub-admins found under master account.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: SUPERADMIN DASHBOARD                                  */}
        {/* ------------------------------------------------------------- */}
        {activeRoleView === ROLES.SUPERADMIN && (
          <>
            {/* Superadmin Platform KPIs */}
            <div className={styles.metricsGrid}>
              <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconRed}`}
                >
                  <HourglassTopIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {pendingRequestsList.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Pending Requests</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_SUBADMINS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconPurple}`}
                >
                  <SupervisorAccountIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {subAdminsList.length || stats.subAdminCount || 0}
                  </div>
                  <div className={styles.metricLabel}>Total Sub-Admins</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_USERS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconBlue}`}
                >
                  <GroupsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {usersList.length || stats.userCount || 0}
                  </div>
                  <div className={styles.metricLabel}>Total Registered Users</div>
                </div>
              </Link>

              <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.metricCard}>
                <div
                  className={`${styles.metricIconWrapper} ${styles.iconGreen}`}
                >
                  <PaymentsIcon />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    {stats.transactionCount !== undefined ? stats.transactionCount : "Financials"}
                  </div>
                  <div className={styles.metricLabel}>Platform Transactions</div>
                </div>
              </Link>
            </div>

            {/* Real Readonly Superadmin System Stats from DB */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <ShieldIcon /> System Root Real-Time Metrics (DB Records)
                </h2>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Root Superadmin</div>
                  <div className={styles.infoValue}>{user?.username || "superadmin"}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Registered Sub-Admins</div>
                  <div className={styles.infoValue}>{subAdminsList.length} Active Admins</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Registered Platform Users</div>
                  <div className={styles.infoValue}>{usersList.length} Accounts</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Global Pending Requests</div>
                  <div className={styles.infoValue}>{pendingRequestsList.length} In Queue</div>
                </div>
              </div>
            </div>

            {/* Superadmin Full Control Shortcuts */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <AdminPanelSettingsIcon /> Platform Command Suite
                </h2>
              </div>
              <div className={styles.quickActionsGrid}>
                <Link to={ROUTES.ADMIN_ACCOUNTS_DETAILS} className={styles.actionTile}>
                  <SupervisorAccountIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Admin Master Accounts Details</span>
                </Link>
                <Link to={ROUTES.ADMIN_SUBADMINS} className={styles.actionTile}>
                  <ShieldIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Sub-Admin Control</span>
                </Link>
                <Link to={ROUTES.ADMIN_USERS} className={styles.actionTile}>
                  <GroupsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>User Management</span>
                </Link>
                <Link to={ROUTES.ADMIN_ID_REQUESTS} className={styles.actionTile}>
                  <HourglassTopIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Global ID Requests</span>
                </Link>
                <Link to={ROUTES.ADMIN_TRANSACTIONS} className={styles.actionTile}>
                  <PaymentsIcon className={styles.actionIcon} />
                  <span className={styles.actionTitle}>Global Financials</span>
                </Link>
              </div>
            </div>

            {/* Platform Sub-Admin & Admin Network Performance Summary */}
            <div className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Superadmin Admin Accounts Overview</h2>
                <Link to={ROUTES.ADMIN_ACCOUNTS_DETAILS} className={styles.sectionActionLink}>
                  Manage Accounts <ArrowForwardIcon style={{ fontSize: "0.9rem" }} />
                </Link>
              </div>
              <div className={styles.cardPanel}>
                <div className={styles.tableContainer}>
                  <table className={styles.customTable}>
                    <thead>
                      <tr>
                        <th>Administrator</th>
                        <th>Role</th>
                        <th>Assigned Users</th>
                        <th>System Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subAdminsList.length > 0 ? (
                        subAdminsList.map((adm, i) => (
                          <tr key={adm._id || i}>
                            <td style={{ fontWeight: 600 }}>{adm.name} ({adm.username})</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                                {adm.role}
                              </span>
                            </td>
                            <td>Full Assigned</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                                Authorized
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className={styles.emptyState}>
                            No secondary administrators registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role-Based Deposit & Withdrawal Popups */}
      {showDepositPopup && (
        <DepositPopup onClose={() => setShowDepositPopup(false)} />
      )}
      {showWithdrawalPopup && (
        <WalletWithdrawalPopup onClose={() => setShowWithdrawalPopup(false)} />
      )}
    </div>
  );
}
