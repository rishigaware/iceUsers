import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./MyId.module.css";
import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";

import { PulseLoader } from "react-spinners";
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FiEdit3, FiMoreVertical, FiX } from "react-icons/fi";
import { AiOutlineTransaction, AiOutlineInfoCircle } from "react-icons/ai";
import NewDepositPopup from "./NewDepositPopup";
import NewWithdrawalPopup from "./NewWithdrawalPopup";
import ViewTransactionModal from "./ViewTransactionModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { Toast } from "primereact/toast";

const MyId = () => {

  const { user, url } = useUser();
  const safeUser = user || {};
  const safeUrl = url || '';
  const [myIds, setMyIds] = useState([]);
  const [idRequests, setIdRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [needRefetch, setNeedRefetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showNewDepositPopup, setShowNewDepositPopup] = useState(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState(false);
  const [isWithdrawalPopupVisible, setIsWithdrawalPopupVisible] = useState(false);

  const [mobilePopupOpen, setMobilePopupOpen] = useState(null);

  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedIdForModal, setSelectedIdForModal] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const toast = useRef(null);

  const fetchIds = useCallback(async () => {
    if (!safeUser?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`${safeUrl}/api/user/get-all-ids?userId=${safeUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setMyIds(Array.isArray(data) ? data : []);
      } else {
        // console.error("Error fetching IDs:", data);
        setMyIds([]);
      }
    } catch (error) {
      console.error("Failed to fetch IDs:", error);
      setError("Failed to fetch IDs");
    } finally {
      setLoading(false);
    }
  }, [safeUser?.id, safeUrl]);

  const fetchIdRequests = useCallback(async () => {
    if (!safeUser?.id) return;
    try {
      const response = await fetch(`${safeUrl}/api/user/get-id-requests?userId=${safeUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setIdRequests(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching ID requests:", data);
      }
    } catch (error) {
      console.error("Failed to fetch ID requests:", error);
    }
  }, [safeUser?.id, safeUrl]);

  useEffect(() => {
    if (safeUser?.id || needRefetch) {
      fetchIds();
      fetchIdRequests();
      if (needRefetch) setNeedRefetch(false);
    }
  }, [safeUser?.id, needRefetch, fetchIds, fetchIdRequests]);

  // DISABLED: Automatic status updates to prevent infinite API calls
  // useEffect(() => {
  //   if (!safeUser?.id) return;
  //   const interval = setInterval(() => {
  //     checkStatusUpdates();
  //   }, 120000);
  //   return () => clearInterval(interval);
  // }, [safeUser?.id]);
  
  // Handle info icon click to show ID details
  const handleInfoClick = (item) => {
    setSelectedId(item);
    setChangePasswordPopup(true);
  };

  const handleClosePopup = () => {
    setSelectedId(null);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };


  const handleDepositClick = (item) => {
    setSelectedId(item);
    setShowNewDepositPopup(true);
  };

  const handleWithdrawalClick = (item) => {
    setSelectedId(item);
    setIsWithdrawalPopupVisible(true);
  };

  const closeNewDepositPopup = () => setShowNewDepositPopup(false);
  const closeWithdrawalPopup = () => setIsWithdrawalPopupVisible(false);

  const refreshIdRequests = async () => {
    await fetchIdRequests();
    // Also refresh active IDs to catch newly approved ones
    setNeedRefetch(true);
    toast.current.show({
      severity: 'info',
      summary: 'Refreshed',
      detail: 'ID requests and active IDs refreshed successfully',
      life: 2000
    });
  };

  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch(`${safeUrl}/api/admin/get-websites`);
        if (response.ok) {
          const data = await response.json();
          setWebsites(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch websites for admin links:", err);
      }
    };
    fetchWebsites();
  }, [safeUrl]);

  const getAdminUrl = useCallback((item) => {
    if (item?.adminUrl && item.adminUrl.trim()) return item.adminUrl.trim();
    if (!websites || websites.length === 0) return '';
    
    const name = (item?.websiteName || item?.website || '').toLowerCase().trim();
    const urlStr = (item?.websiteUrl || item?.url || '').toLowerCase().trim().replace(/\/+$/, '');

    // 1. Direct name or URL match
    const directMatch = websites.find(w => {
      const wAdmin = (w.adminUrl || '').trim();
      if (!wAdmin) return false;
      const wName = (w.website || w.name || '').toLowerCase().trim();
      const wUrl = (w.url || '').toLowerCase().trim().replace(/\/+$/, '');
      return (name && wName === name) || (urlStr && wUrl === urlStr);
    });
    if (directMatch?.adminUrl) return directMatch.adminUrl.trim();

    // 2. Hostname match
    try {
      if (urlStr.startsWith('http')) {
        const host = new URL(urlStr).hostname.replace(/^www\./, '');
        const hostMatch = websites.find(w => {
          const wAdmin = (w.adminUrl || '').trim();
          if (!wAdmin || !w.url) return false;
          try {
            const wHost = new URL(w.url.toLowerCase().trim()).hostname.replace(/^www\./, '');
            return host && wHost && (host === wHost || host.includes(wHost) || wHost.includes(host));
          } catch (e) {
            return false;
          }
        });
        if (hostMatch?.adminUrl) return hostMatch.adminUrl.trim();
      }
    } catch (_e) {
      // Ignore URL parsing errors
    }

    // 3. Partial name match
    const partialMatch = websites.find(w => {
      const wAdmin = (w.adminUrl || '').trim();
      if (!wAdmin) return false;
      const wName = (w.website || w.name || '').toLowerCase().trim();
      return name && wName && (name.includes(wName) || wName.includes(name));
    });
    if (partialMatch?.adminUrl) return partialMatch.adminUrl.trim();

    return '';
  }, [websites]);

  // Combine regular IDs and ID requests
  const allIds = [
    ...(myIds || []).map(id => ({ ...id, adminUrl: id.adminUrl || getAdminUrl(id), type: 'active' })),
    ...(idRequests || []).filter(request => request.status === 'Pending').map(request => ({ ...request, adminUrl: request.adminUrl || getAdminUrl(request), type: 'request' }))
  ];

  const filteredIds = allIds.filter(
    (id) =>
      (id.websiteName && id.websiteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.websiteUrl && id.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.adminUrl && id.adminUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (id.username && id.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredIds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIds = filteredIds.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pageNumbers;
  };

  const handleMobileMenuToggle = (itemId, event) => {
    event.stopPropagation();
    setMobilePopupOpen(mobilePopupOpen === itemId ? null : itemId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobilePopupOpen && !event.target.closest(`.${styles.mobileMenu}`)) {
        setMobilePopupOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobilePopupOpen]);

  // Handle view transaction
  const handleViewTransaction = (item) => {
    setSelectedIdForModal(item);
    setShowViewTransactionModal(true);
  };

  // Handle change password
  const handleChangePassword = (item) => {
    setSelectedIdForModal(item);
    setShowChangePasswordModal(true);
  };

  // Handle close ID with confirmation
  const handleCloseId = async (id) => {
    if (!user) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'User not logged in', life: 3000 });
      return;
    }
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to close this ID? This action will send a close request to the admin.');
    if (!confirmed) {
      return;
    }
    
    try {
      const response = await fetch(`${url}/api/user/request-close-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, createdBy: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Request Sent', detail: 'Close ID request sent to admin successfully', life: 3000 });
        setNeedRefetch(true);
      } else {
        throw new Error(data.message || 'Failed to send close ID request');
      }
    } catch (error) {
      console.error('Error sending close ID request:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to send close ID request', life: 3000 });
    }
  };

  const handleMobileAction = (action, item) => {
    setMobilePopupOpen(null);
    switch (action) {
      case 'info':
        handleInfoClick(item);
        break;
      case 'deposit':
        handleDepositClick(item);
        break;
      case 'withdrawal':
        handleWithdrawalClick(item);
        break;
      case 'changePassword':
        handleChangePassword(item);
        break;
      case 'viewTransaction':
        handleViewTransaction(item);
        break;
      case 'closeId':
        handleCloseId(item.id);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <PulseLoader color="var(--primary-color)" loading={loading} size={15} />
      </div>
    );
  }

  if (error) {
    return <p className={styles.error}><strong>No IDs created yet</strong></p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by website name, URL, or username"
          className={styles.searchInput}
        />
        <button 
          onClick={refreshIdRequests}
          className={styles.refreshButton}
          title="Refresh ID Requests"
        >
          🔄
        </button>
      </div>
      <div className={styles.idsCount}>
        {filteredIds.length === 0 ? 'No IDs found' : `${filteredIds.length} ID${filteredIds.length === 1 ? '' : 's'} found`}
        {filteredIds.length > itemsPerPage && (
          <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredIds.length)} of {filteredIds.length}</span>
        )}
      </div>

      {currentIds.length === 0 ? (
        <p className={styles.noIds}>No IDs match your search criteria.</p>
      ) : (
        currentIds.map((item) => (
          <div key={item.id} className={`${styles.idCard} ${item.type === 'request' ? styles.requestCard : ''}`}>
            <div className={styles.logo}>
              <img
                src={getImageUrl(item.imgUrl, safeUrl)}
                alt={`${item.websiteName || 'Website'} logo`}
              />
              {item.type === 'request' && (
                <div className={styles.requestBadge}>
                  <span className={styles.requestStatus}>{item.status || 'Pending'}</span>
                </div>
              )}
            </div>
            <div className={styles.details}>
              <p className={styles.websiteName}>{item.websiteName || 'N/A'}</p>
              {item.websiteUrl && (
                <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  {item.websiteUrl}
                </a>
              )}
              {item.adminUrl && (
                <a href={item.adminUrl} target="_blank" rel="noopener noreferrer" className={styles.adminUrlLink}>
                  Admin: {item.adminUrl}
                </a>
              )}
              <p className={styles.userId}><strong>username : </strong>{item.username || 'N/A'}</p>
              {item.type === 'request' ? (
                <>
                  <p className={styles.idBalance}><strong>Coins Requested : </strong>{item.coinAmount || 0} coins</p>
                  <p className={styles.idBalance}><strong>Amount : </strong>₹{item.convertedCoins || 0}</p>
                  <p className={styles.coinRate}><strong>Rate : </strong>1 coin = ₹{item.coinRate}</p>
                  <p className={styles.requestDate}><strong>Requested : </strong>{new Date(item.createdAt).toLocaleDateString()}</p>
                </>
              ) : (
                <>
                  <p className={styles.idBalance}><strong>Last Updated Balance : </strong>{item.balance || 0} coins</p>
                  <p className={styles.coinRate}><strong>Rate : </strong>1 coin = ₹{item.coinRate}</p>
                  {/* Show status chip if ID is closed or close requested */}
                  {(item.status === 'Closed' || item.status === 'Close Requested') && (
                    <div className={styles.statusChipContainer}>
                      <span className={`${styles.statusChip} ${item.status === 'Closed' ? styles.closedChip : styles.closeRequestedChip}`}>
                        {item.status}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {item.type === 'request' ? (
              <div className={styles.iconContainer}>
                <div className={styles.requestOptions}>
                  <p className={styles.requestInfo}>Waiting for approval...</p>
                </div>
              </div>
            ) : item.status === 'Closed' ? (
              <div className={styles.iconContainer}>
                <div className={styles.closedIdMessage}>
                  <p className={styles.closedInfo}>This ID is closed</p>
                </div>
              </div>
            ) : item.status === 'Close Requested' ? (
              <div className={styles.iconContainer}>
                <div className={styles.closeRequestedMessage}>
                  <p className={styles.closeRequestedInfo}>Close request pending admin approval</p>
                </div>
              </div>
            ) : (
              <div className={styles.iconContainer}>
                <div className={styles.desktopIcons}>
                  <div className={styles.iconWrapper}>
                    <AiOutlineInfoCircle className={`${styles.icon} ${styles.infoIcon}`} title="ID Details" onClick={() => handleInfoClick(item)} />
                    <p className={styles.iconLabel}>ID Details</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <PiHandDepositDuotone className={`${styles.icon} ${styles.depositIcon}`} title="Deposit" onClick={() => handleDepositClick(item)} />
                    <p className={styles.iconLabel}>Deposit</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <BiMoneyWithdraw className={`${styles.icon} ${styles.withdrawalIcon}`} title="Withdrawal" onClick={() => handleWithdrawalClick(item)} />
                    <p className={styles.iconLabel}>Withdrawal</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <FiEdit3 className={`${styles.icon} ${styles.editIcon}`} title="Change Password" onClick={() => handleChangePassword(item)} />
                    <p className={styles.iconLabel}>Change Password</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <AiOutlineTransaction className={`${styles.icon} ${styles.transactionIcon}`} title="View Transaction" onClick={() => handleViewTransaction(item)} />
                    <p className={styles.iconLabel}>View Transaction</p>
                  </div>
                  <div className={styles.iconWrapper}>
                    <FiX className={`${styles.icon} ${styles.closeIcon}`} title="Close ID" onClick={() => handleCloseId(item.id)} />
                    <p className={styles.iconLabel}>Close ID</p>
                  </div>
                </div>

                <div className={styles.mobileMenu}>
                  <FiMoreVertical className={styles.threeDotsIcon} onClick={(e) => handleMobileMenuToggle(item.id, e)} />
                  {mobilePopupOpen === item.id && (
                    <div className={styles.mobilePopup}>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('info', item)}>
                        <AiOutlineInfoCircle className={`${styles.mobileIcon} ${styles.infoIcon}`} />
                        <span>ID Details</span>
                      </div>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('deposit', item)}>
                        <PiHandDepositDuotone className={`${styles.mobileIcon} ${styles.depositIcon}`} />
                        <span>Deposit</span>
                      </div>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('withdrawal', item)}>
                        <BiMoneyWithdraw className={`${styles.mobileIcon} ${styles.withdrawalIcon}`} />
                        <span>Withdrawal</span>
                      </div>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('changePassword', item)}>
                        <FiEdit3 className={`${styles.mobileIcon} ${styles.editIcon}`} />
                        <span>Change Password</span>
                      </div>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('viewTransaction', item)}>
                        <AiOutlineTransaction className={`${styles.mobileIcon} ${styles.transactionIcon}`} />
                        <span>View Transaction</span>
                      </div>
                      <div className={styles.mobilePopupItem} onClick={() => handleMobileAction('closeId', item)}>
                        <FiX className={`${styles.mobileIcon} ${styles.closeIcon}`} />
                        <span>Close ID</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {filteredIds.length > itemsPerPage && (
        <div className={styles.paginationContainer}>
          <button className={styles.paginationButton} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>←</button>
          {getPageNumbers().map((number, index) => (
            <button key={index} className={`${styles.paginationButton} ${number === currentPage ? styles.active : ''}`} onClick={() => typeof number === 'number' && setCurrentPage(number)} disabled={number === '...'}>{number}</button>
          ))}
          <button className={styles.paginationButton} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>→</button>
          <div className={styles.paginationInfo}>Page {currentPage} of {totalPages}</div>
        </div>
      )}

      {selectedId && changePasswordPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button onClick={handleClosePopup} className={styles.closeButton}>
              <FiX />
            </button>
            <div className={styles.popupHeader}>
              <img src={getImageUrl(selectedId.imgUrl, url)} alt={`${selectedId.websiteName} logo`} className={styles.popupLogo} />
              <div className={styles.headerText}>
                <h2>{selectedId.websiteName}</h2>
                <p>{selectedId.websiteUrl}</p>
                {selectedId.adminUrl && (
                  <a
                    href={selectedId.adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.adminUrlLink}
                  >
                    Admin: {selectedId.adminUrl}
                  </a>
                )}
              </div>
            </div>
            <div className={styles.popupBody}>
              <p><strong>Username:</strong> {selectedId.username}</p>
              <p><strong>Password:</strong> {selectedId.password || 'Not set'}</p>
              <p><strong>Balance:</strong> {selectedId.balance || 0} coins</p>
              {selectedId.coinRate && <p><strong>Coin Rate:</strong> 1 coin = ₹{selectedId.coinRate}</p>}
              <p className={styles.popStatusText}><strong>Status :&nbsp;</strong>
                <span className={selectedId.popStatus === "Requested" ? styles.popStatusRequested : selectedId.status === "Created" ? styles.popStatusCreated : selectedId.status === "Username Exists" ? styles.popStatusUsernameExist : styles.popStatusActive}>{selectedId.status}</span>
              </p>
              <p><strong>Created At:</strong> {selectedId.createdAt?._seconds ? formatDate(selectedId.createdAt._seconds) : (selectedId.createdAt ? new Date(selectedId.createdAt).toLocaleString() : 'N/A')}</p>
            </div>
          </div>
        </div>
      )}

      {showNewDepositPopup && <NewDepositPopup onClose={closeNewDepositPopup} selectedId={selectedId} />}
      {isWithdrawalPopupVisible && <NewWithdrawalPopup onClose={closeWithdrawalPopup} selectedId={selectedId} />}
      {showViewTransactionModal && <ViewTransactionModal isOpen={showViewTransactionModal} onClose={() => setShowViewTransactionModal(false)} idData={selectedIdForModal} />}
      {showChangePasswordModal && <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} idData={selectedIdForModal} />}
      
      <Toast ref={toast} />
    </div>
  );
};

export default MyId;