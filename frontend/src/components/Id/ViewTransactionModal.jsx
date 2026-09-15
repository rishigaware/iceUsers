import React, { useState, useEffect } from 'react';
import styles from './ViewTransactionModal.module.css';
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const ViewTransactionModal = ({ isOpen, onClose, idData }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, url } = useUser();
  const toast = useRef(null);

  useEffect(() => {
    if (isOpen && idData && user) {
      fetchTransactions();
    }
  }, [isOpen, idData, user]);

  const fetchTransactions = async () => {
    if (!idData || !user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${url}/api/user/id-transactions?id=${idData.id}&userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch transactions',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'completed':
        return styles.statusAccepted;
      case 'rejected':
      case 'failed':
        return styles.statusRejected;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const getTransactionTypeColor = (paymentMethod, description) => {
    const method = paymentMethod?.toLowerCase() || '';
    const desc = description?.toLowerCase() || '';
    
    if (method.includes('deposit') || desc.includes('deposit')) {
      return styles.typeDeposit;
    } else if (method.includes('withdraw') || desc.includes('withdraw')) {
      return styles.typeWithdrawal;
    } else if (desc.includes('password') || desc.includes('change')) {
      return styles.typePasswordChange;
    } else if (method.includes('bank') || method.includes('upi') || method.includes('card')) {
      return styles.typeDeposit;
    } else {
      return styles.typeDefault;
    }
  };

  const getTransactionTypeLabel = (paymentMethod, description) => {
    const method = paymentMethod?.toLowerCase() || '';
    const desc = description?.toLowerCase() || '';
    
    if (method.includes('deposit') || desc.includes('deposit')) {
      return 'Deposit';
    } else if (method.includes('withdraw') || desc.includes('withdraw')) {
      return 'Withdrawal';
    } else if (desc.includes('password') || desc.includes('change')) {
      return 'Password Change';
    } else if (method.includes('bank') || method.includes('upi') || method.includes('card')) {
      return 'Deposit';
    } else {
      return 'Transaction';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Toast ref={toast} />
        
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <img
              src={getImageUrl(idData?.imgUrl, url)}
              alt={`${idData?.websiteName} logo`}
              className={styles.websiteLogo}
            />
            <div className={styles.websiteInfo}>
              <h2>{idData?.websiteName}</h2>
              <p className={styles.websiteUrl}>{idData?.websiteUrl}</p>
              <p className={styles.username}>Username: {idData?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <h3 className={styles.sectionTitle}>Transaction History</h3>
          
          {/* Transaction Summary */}
          {transactions.length > 0 && (
            <div className={styles.transactionSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Transactions:</span>
                <span className={styles.summaryValue}>{transactions.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Completed:</span>
                <span className={styles.summaryValue}>
                  {transactions.filter(t => t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'accepted').length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Failed:</span>
                <span className={styles.summaryValue}>
                  {transactions.filter(t => t.status?.toLowerCase() === 'failed' || t.status?.toLowerCase() === 'rejected').length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pending:</span>
                <span className={styles.summaryValue}>
                  {transactions.filter(t => t.status?.toLowerCase() === 'pending').length}
                </span>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading transactions...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={fetchTransactions} className={styles.retryButton}>
                Retry
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className={styles.noTransactions}>
              <p>No transactions found for this ID.</p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div className={styles.transactionHeader}>
                    <div className={styles.transactionType}>
                      <span className={`${styles.typeBadge} ${getTransactionTypeColor(transaction.paymentMethod, transaction.description)}`}>
                        {getTransactionTypeLabel(transaction.paymentMethod, transaction.description)}
                      </span>
                      <span className={`${styles.statusBadge} ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                  
                  <div className={styles.transactionDetails}>
                    {transaction.description && (
                      <p className={styles.description}>
                        <strong>Description:</strong> {transaction.description}
                      </p>
                    )}
                    {transaction.amount && (
                      <p className={styles.amount}>
                        <strong>Amount:</strong> {transaction.amount}
                      </p>
                    )}
                    {transaction.paymentMethod && (
                      <p className={styles.paymentMethod}>
                        <strong>Payment Method:</strong> {transaction.paymentMethod}
                      </p>
                    )}
                    {transaction.reason && (
                      <p className={styles.reason}>
                        <strong>Reason:</strong> {transaction.reason}
                      </p>
                    )}
                    {transaction.websiteName && (
                      <p className={styles.websiteName}>
                        <strong>Website:</strong> {transaction.websiteName}
                      </p>
                    )}
                    {transaction.username && (
                      <p className={styles.username}>
                        <strong>Username:</strong> {transaction.username}
                      </p>
                    )}
                    {transaction.createdBy && (
                      <p className={styles.createdBy}>
                        <strong>User ID:</strong> {transaction.createdBy}
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTransactionModal;
