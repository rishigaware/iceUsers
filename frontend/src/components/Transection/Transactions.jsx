import React, { useState, useEffect } from 'react';
import styles from './Transaction.module.css';
import TopNavbar from '../Navbar/TopNavbar';
import { PulseLoader } from "react-spinners"; // Import the PacmanLoader
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LoginPopup from '../Login/LoginPopup'

import { useUser } from "../../context/UserContext";
import { getImageUrl } from "../../utils/imageUrl";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Track selected image for modal
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  const navigate = useNavigate();
  const { user , url} = useUser();

  // Open/close modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null); // Clear selected image when modal closes
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    if (!user || !user.id) {
      setError("User ID is not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/user/deposit-transaction?userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transactions: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      // Sort transactions by creation date (newest first)
      const sortedTransactions = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTransactions(sortedTransactions);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err) {
      setTransactions([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch transactions when user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setIsModalOpen(true); // Open login modal if no user is logged in
      return;
    }

    fetchTransactions();
  }, [user]);

  // Set up periodic refresh to check for status updates
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Handle image click to open modal
  const handleImageClick = (imagePath) => {
    setSelectedImage(getImageUrl(imagePath, url));
    setIsModalOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className={styles.transactionHistory}>
        <TopNavbar />
        <h3 className={styles.heading}><strong>Transaction History</strong></h3>
        <div className={styles.loading}>
          <PulseLoader color="var(--primary-color)" loading={loading} size={15} />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.transactionHistory}>
        <TopNavbar />
        <h3 className={styles.heading}><strong>Transaction History</strong></h3>
        <div className={styles.errorContainer}>
          <p className={styles.noRecords}>No Transection record</p>
        </div>
      </div>
    );
  }

  // Render transactions
  return (
    <div className={styles.transactionHistory}>
      <TopNavbar />
      <div className={styles.headerSection}>
        <h3 className={styles.heading}><strong>Transaction History</strong></h3>
        <button 
          className={styles.refreshButton}
          onClick={fetchTransactions}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* Transactions Count */}
      <div className={styles.transactionsCount}>
        {transactions.length === 0 ? 'No transactions found' : `${transactions.length} transaction${transactions.length === 1 ? '' : 's'} found`}
        {transactions.length > transactionsPerPage && (
          <span> • Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length}</span>
        )}
      </div>
      
      <div className={styles.transactions}>
        {currentTransactions.length > 0 ? (
          currentTransactions.map((txn) => (
            <div className={styles.transactionItem} key={txn.id}>
              <div className={styles.column}><strong>Description:</strong> {txn.description}</div>
              <div className={styles.column}><strong>Payment Method:</strong> {txn.paymentMethod}</div>
              <div className={styles.column}><strong>Created At:</strong> {new Date(txn.createdAt).toLocaleString()}</div>
              <div className={`${styles.column} ${styles.status} ${styles[txn.status] || styles.defaultStatus}`}>
                <strong>Status:</strong> {txn.status}
              </div>
              <div className={`${styles.column} ${styles.amountField}`}>
                <strong>Amount:</strong> ₹{txn.amount}
              </div>
              <div className={styles.column}>
                {txn.imagePath && (
                  <img
                    src={getImageUrl(txn.imagePath, url)}
                    alt="Transaction"
                    className={styles.transactionImage}
                    onClick={() => handleImageClick(txn.imagePath)} // Open modal on click
                    onError={(e) => {
                      e.target.style.display = "none"; // Hide the image if it fails to load
                    }}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noTransactions}>No transactions yet.</p>
        )}
      </div>

      {/* Pagination */}
      {transactions.length > transactionsPerPage && (
        <div className={styles.paginationContainer}>
          {/* Previous Button */}
          <button
            className={styles.paginationButton}
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            ←
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((number, index) => (
            <button
              key={index}
              className={`${styles.paginationButton} ${
                number === currentPage ? styles.active : ''
              }`}
              onClick={() => typeof number === 'number' && paginate(number)}
              disabled={number === '...'}
            >
              {number}
            </button>
          ))}

          {/* Next Button */}
          <button
            className={styles.paginationButton}
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            →
          </button>

          {/* Page Info */}
          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      { selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <img src={selectedImage} alt="Full Transaction" className={styles.fullImage} />
        </div>
      )}
      
      <LoginPopup isOpen={isModalOpen} isClose={closeModal} />
    </div>
  );
};

export default Transactions;
