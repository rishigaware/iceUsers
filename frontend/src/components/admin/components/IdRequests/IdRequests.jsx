import React, { useState, useEffect, useRef } from 'react';
import styles from './IdRequests.module.css';
import { useUser } from '../../../../context/UserContext';
import { getImageUrl } from '../../../../utils/imageUrl';
import { Toast } from 'primereact/toast';
import { PulseLoader } from 'react-spinners';
import { FaCheck, FaTimes, FaEye, FaCoins, FaUser, FaGlobe, FaClock, FaRupeeSign } from 'react-icons/fa';
import TopNavbar from '../Navbar/TopNavbar';
import { Chip } from '@mui/material';

const IdRequests = () => {
  const { user, url } = useUser();
  const toast = useRef(null);
  const [idRequests, setIdRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const canManageIdRequests = isSuperAdmin || user?.permissions?.canManageIdRequests !== false;
  const adminHeaderId = user?.id || user?._id || user?.username || '';

  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdminFilter, setSelectedSubAdminFilter] = useState("all");
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch sub-admins for superadmin
  const fetchSubAdmins = async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch(`${url}/api/admin/get-subadmins`, {
        headers: { 'x-admin-id': adminHeaderId }
      });
      if (response.ok) {
        const data = await response.json();
        setSubAdmins(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching sub-admins:", err);
    }
  };

  useEffect(() => {
    fetchIdRequests(selectedSubAdminFilter);
    if (isSuperAdmin) {
      fetchSubAdmins();
    }
  }, [selectedSubAdminFilter]);

  const fetchIdRequests = async (filterId = selectedSubAdminFilter) => {
    try {
      setIsLoading(true);
      const queryParam = isSuperAdmin && filterId && filterId !== 'all'
        ? `?filterAdminId=${filterId}`
        : '';
      const response = await fetch(`${url}/api/admin/id-requests${queryParam}`, {
        headers: {
          'x-admin-id': adminHeaderId,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setIdRequests(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching ID requests:', data);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch ID requests',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to fetch ID requests:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch ID requests',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      const response = await fetch(`${url}/api/admin/update-id-request-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': adminHeaderId,
        },
        body: JSON.stringify({
          requestId: requestId,
          status: status,
          adminNotes: adminNotes,
          processedBy: user?.username || 'admin',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: `ID request ${status.toLowerCase()} successfully`,
          life: 3000,
        });
        fetchIdRequests(selectedSubAdminFilter);
        handleCloseModal();
      } else {
        console.error('Error updating status:', data);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: data.message || 'Failed to update status',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update status',
        life: 3000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    if (status === 'Accepted') color = 'success';
    if (status === 'Rejected') color = 'error';
    if (status === 'Pending') color = 'warning';

    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        variant={status === 'Pending' ? 'outlined' : 'filled'}
        sx={{
          fontWeight: 700,
          fontSize: '0.72rem',
          height: '24px',
          letterSpacing: '0.3px',
        }}
      />
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedRequests = idRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <PulseLoader color="var(--primary-color)" loading={isLoading} size={15} />
        <p>Loading ID requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toast ref={toast} />
      <TopNavbar />
      <div className={styles.header}>
        <h1 className={styles.title}>ID Creation Requests</h1>
        <p className={styles.subtitle}>Manage user ID creation requests with coin conversion</p>
      </div>

      {/* Superadmin Sub-admin Filter */}
      {isSuperAdmin && (
        <div className={styles.filterContainer}>
          <span className={styles.filterLabel}>Filter by Admin Master:</span>
          <select
            value={selectedSubAdminFilter}
            onChange={(e) => {
              setSelectedSubAdminFilter(e.target.value);
              setPage(0);
            }}
            className={styles.filterSelect}
          >
            <option value="all">All Admin Masters</option>
            {subAdmins.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.username} {sa.name ? `(${sa.name})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {idRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCoins className={styles.emptyIcon} />
          <h3>No ID Requests Found</h3>
          <p>There are currently no ID creation requests to review.</p>
        </div>
      ) : (
        <>
          {/* Table View for Tablets and Desktops */}
          <div className={styles.tableView}>
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Website</th>
                  <th>User Info</th>
                  <th>Amount / Coins</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td className={styles.serialCell}>
                      <span className={styles.serialNumber}>
                        {page * rowsPerPage + index + 1}
                      </span>
                    </td>
                    <td className={styles.websiteCell}>
                      <div className={styles.websiteInfo}>
                        <img
                          src={getImageUrl(request.imgUrl, url)}
                          alt={request.websiteName}
                          className={styles.tableLogo}
                        />
                        <div>
                          <div className={styles.tableSiteName}>{request.websiteName}</div>
                          <a 
                            href={request.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.tableSiteUrl}
                          >
                            {request.websiteUrl}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableUserInfo}>
                        <div><strong>User:</strong> {request.username}</div>
                        <div className={styles.tableSubtext}>By: {request.createdBy}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableCoinInfo}>
                        <div className={styles.tableAmount}>₹{request.convertedCoins}</div>
                        <div className={styles.tableCoins}>
                          <FaCoins style={{ color: 'var(--warning-color)' }} /> {request.coinAmount}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getStatusChip(request.status)}
                    </td>
                    <td>
                      <div className={styles.tableDateInfo}>
                        <div>{formatDate(request.createdAt)}</div>
                        {request.processedAt && (
                          <div className={styles.tableSubtext}>
                            Proc: {formatDate(request.processedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.tableViewBtn}
                          onClick={() => handleViewDetails(request)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {request.status === 'Pending' && canManageIdRequests && (
                          <>
                            <button
                              className={styles.tableAcceptBtn}
                              onClick={() => handleUpdateStatus(request.id, 'Accepted')}
                              disabled={actionLoading === request.id}
                              title="Accept"
                            >
                              {actionLoading === request.id ? (
                                <PulseLoader size={6} color="#000000" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button
                              className={styles.tableRejectBtn}
                              onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                              disabled={actionLoading === request.id}
                              title="Reject"
                            >
                              {actionLoading === request.id ? (
                                <PulseLoader size={6} color="#ffffff" />
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card View for Mobile & Tablets */}
          <div className={styles.cardView}>
            <div className={styles.requestsGrid}>
              {paginatedRequests.map((request, index) => (
                <div key={request.id} className={styles.requestCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <img
                        src={getImageUrl(request.imgUrl, url)}
                        alt={request.websiteName}
                        className={styles.websiteLogo}
                      />
                      <div className={styles.websiteDetails}>
                        <h3 className={styles.websiteName}>{request.websiteName}</h3>
                        <a 
                          href={request.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.websiteUrl}
                        >
                          {request.websiteUrl}
                        </a>
                      </div>
                    </div>
                    <div className={styles.cardHeaderRight}>
                      <span className={styles.serialBadge}>
                        #{page * rowsPerPage + index + 1}
                      </span>
                      {getStatusChip(request.status)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <div className={styles.infoItem}>
                        <FaUser className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Username</span>
                          <span className={styles.infoValue}>{request.username}</span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <FaUser className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Created By</span>
                          <span className={styles.infoValue}>{request.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.infoItem}>
                        <FaRupeeSign className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Amount</span>
                          <span className={`${styles.infoValue} ${styles.amountValue}`}>
                            ₹{request.convertedCoins}
                          </span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <FaCoins className={styles.infoIcon} style={{ color: 'var(--warning-color)' }} />
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Coins</span>
                          <span className={styles.infoValue}>{request.coinAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <div className={styles.infoItem}>
                        <FaClock className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Created</span>
                          <span className={styles.infoValue}>{formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                      {request.processedAt && (
                        <div className={styles.infoItem}>
                          <FaClock className={styles.infoIcon} />
                          <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Processed</span>
                            <span className={styles.infoValue}>{formatDate(request.processedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className={styles.cardActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewDetails(request)}
                    >
                      <FaEye className={styles.buttonIcon} /> View
                    </button>
                    
                    {request.status === 'Pending' && canManageIdRequests && (
                      <>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleUpdateStatus(request.id, 'Accepted')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <PulseLoader size={7} color="#000000" />
                          ) : (
                            <>
                              <FaCheck className={styles.buttonIcon} /> Accept
                            </>
                          )}
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <PulseLoader size={7} color="#ffffff" />
                          ) : (
                            <>
                              <FaTimes className={styles.buttonIcon} /> Reject
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, idRequests.length)} of {idRequests.length} requests
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                First
              </button>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {Math.ceil(idRequests.length / rowsPerPage)}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(idRequests.length / rowsPerPage) - 1}
              >
                Next
              </button>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(Math.ceil(idRequests.length / rowsPerPage) - 1)}
                disabled={page >= Math.ceil(idRequests.length / rowsPerPage) - 1}
              >
                Last
              </button>
            </div>
            <div className={styles.rowsPerPageContainer}>
              <label htmlFor="rowsPerPage">Rows per page:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                className={styles.rowsPerPageSelect}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Modal for detailed view and actions */}
      {showModal && selectedRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>ID Request Details</h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Website Information</h3>
                <div className={styles.websiteInfo}>
                  <img
                    src={getImageUrl(selectedRequest.imgUrl, url)}
                    alt={selectedRequest.websiteName}
                    className={styles.websiteLogo}
                  />
                  <div>
                    <p><strong>Name:</strong> {selectedRequest.websiteName}</p>
                    <p><strong>URL:</strong> {selectedRequest.websiteUrl}</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>User Information</h3>
                <p><strong>Username:</strong> {selectedRequest.username}</p>
                <p><strong>Created By:</strong> {selectedRequest.createdBy}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Coin Conversion Details</h3>
                <p><strong>Amount:</strong> ₹{selectedRequest.convertedCoins}</p>
                <p><strong>Coins to Receive:</strong> {selectedRequest.coinAmount}</p>
                <p><strong>Coin Rate:</strong> 1₹ = {selectedRequest.coinRate} coins</p>
                <p><strong>Minimum Required:</strong> {selectedRequest.minimumCoins} coins</p>
                <p><strong>Refundable:</strong> {selectedRequest.refundable ? 'Yes' : 'No'}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  className={styles.notesTextarea}
                  rows={3}
                />
              </div>
            </div>

            {selectedRequest.status === 'Pending' && canManageIdRequests && (
              <div className={styles.modalActions}>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Accepted')}
                  className={styles.acceptButton}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <PulseLoader color="#000000" size={8} />
                  ) : (
                    <>
                      <FaCheck className={styles.buttonIcon} />
                      Accept Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                  className={styles.rejectButton}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <PulseLoader color="#ffffff" size={8} />
                  ) : (
                    <>
                      <FaTimes className={styles.buttonIcon} />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast ref={toast} />
    </div>
  );
};

export default IdRequests;
