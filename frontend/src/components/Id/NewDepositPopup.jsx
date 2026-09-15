import React, { useState, useRef, useEffect } from "react";
import styles from "./NewDepositPopup.module.css";
import { Toast } from "primereact/toast";
import { useUser } from "../../context/UserContext";

export default function NewDepositPopup({ onClose, selectedId }) {
  const [coinAmount, setCoinAmount] = useState("");
  const [refundable, setRefundable] = useState("refundable");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coinRate, setCoinRate] = useState(1);
  const [minimumCoins, setMinimumCoins] = useState(0);
  const [availableWalletBalance, setAvailableWalletBalance] = useState(0);
  
  // New state from CreateId logic
  const [displayedRate, setDisplayedRate] = useState(0);
  const [convertedRupees, setConvertedRupees] = useState(0);
  const [actualWebsiteRate, setActualWebsiteRate] = useState(0);

  const toast = useRef(null);
  const { user, refreshUserBalance, url } = useUser();

  useEffect(() => {
    const fetchActualRate = async () => {
      if (selectedId && url) {
        try {
          const response = await fetch(`${url}/api/admin/get-websites`);
          const data = await response.json();
          if (response.ok) {
            const website = data.find(w => 
              (w.website && w.website.toLowerCase().trim() === selectedId.websiteName.toLowerCase().trim()) || 
              (w.name && w.name.toLowerCase().trim() === selectedId.websiteName.toLowerCase().trim())
            );
            if (website) {
              const baseRate = parseFloat(website.coinRate) || 1;
              setActualWebsiteRate(baseRate);
              setCoinRate(baseRate);
              // Initialize displayed rate with base rate
              setDisplayedRate(baseRate);
            } else {
              setActualWebsiteRate(parseFloat(selectedId.coinRate) || 1);
              setCoinRate(parseFloat(selectedId.coinRate) || 1);
              setDisplayedRate(parseFloat(selectedId.coinRate) || 1);
            }
          }
        } catch (error) {
          console.error("Error fetching actual rate:", error);
          setActualWebsiteRate(parseFloat(selectedId.coinRate) || 1);
          setCoinRate(parseFloat(selectedId.coinRate) || 1);
          setDisplayedRate(parseFloat(selectedId.coinRate) || 1);
        }
      }
    };

    fetchActualRate();

    if (selectedId) {
      setMinimumCoins(parseFloat(selectedId.minimumCoins) || 0);
    }
    if (user) {
      setAvailableWalletBalance(parseFloat(user.balance) || 0);
    }
  }, [selectedId, user, url]);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCoinAmountChange = (e) => {
    const value = e.target.value;
    const coins = parseFloat(value) || 0;
    setCoinAmount(value);
    setErrorMessage("");

    let currentRate = actualWebsiteRate || parseFloat(selectedId?.coinRate) || 1;
    
    // Dynamic Rate Logic (Same as CreateId)
    if (coins > 0) { 
        if (coins < 50000) {
            currentRate += 0.03;
        } else if (coins < 100000) {
            currentRate += 0.01;
        }
    }
    
    setDisplayedRate(parseFloat(currentRate.toFixed(2)));

    // Calculate rupees based on effective rate
    const calculatedRupees = coins * currentRate;
    setConvertedRupees(calculatedRupees);
  };

  const handleDeposit = async () => {
    const coins = parseFloat(coinAmount);
    
    if (!coinAmount || isNaN(coins) || coins <= 0) {
      setErrorMessage("Please enter a valid coin amount");
      return;
    }

    if (coins < minimumCoins) {
        setErrorMessage(`Minimum deposit is ${minimumCoins} coins`);
        return;
    }

    // Check if user has sufficient wallet balance
    if (convertedRupees > availableWalletBalance) {
      toast.current.show({
        severity: 'error',
        summary: 'Insufficient Wallet Balance',
        detail: `You need ₹${convertedRupees.toFixed(2)} but have ₹${availableWalletBalance.toFixed(2)}. Please add money to your wallet.`,
        life: 5000
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${url}/api/user/create-new-deposit-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
 body: JSON.stringify({
          amount: convertedRupees, // Rupees to deduct
          coinsToReceive: coins, // Coins to add
          coinRate: displayedRate,
          baseCoinRate: actualWebsiteRate || (selectedId?.coinRate || 1),
          additionalRate: (displayedRate - (actualWebsiteRate || (selectedId?.coinRate || 1))),
          refundable: refundable === "refundable",
          websiteName: selectedId.websiteName,
          websiteUrl: selectedId.websiteUrl,
          username: selectedId.username,
          id: selectedId.id,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          status: 'Pending'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: 'success',
          summary: 'Deposit Request Submitted',
          detail: `Deposit request for ${coins} coins (₹${convertedRupees.toFixed(2)}) submitted successfully.`,
          life: 5000
        });
        
        // Refresh user balance
        await refreshUserBalance();
        
        // Close popup after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to submit deposit request');
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const coins = parseFloat(coinAmount) || 0;
  const isAmountValid = coins > 0;
  const hasSufficientBalance = convertedRupees <= availableWalletBalance;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <Toast ref={toast} />

        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h2>Deposit to {selectedId?.websiteName}</h2>
          <p className={styles.subtitle}>Add coins to your account</p>
        </div>

        {/* Scrollable Content */}
        <div className={styles.scrollableContent}>
          {/* Website Details */}
          <div className={styles.websiteDetails}>
            <h3>Website Details</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Website:</span>
              <span className={styles.value}>{selectedId?.websiteName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>{selectedId?.username}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Base Coin Rate:</span>
              <span className={styles.value}>1 coin = ₹{actualWebsiteRate || selectedId?.coinRate || 1}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Minimum Coins:</span>
              <span className={styles.value}>{minimumCoins} coins</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Last Updated Balance:</span>
              <span className={styles.value}>{selectedId?.balance || 0} coins</span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className={styles.walletBalance}>
            <h3>Your Wallet Balance</h3>
            <div className={styles.balanceDisplay}>
              <span className={styles.balanceAmount}>₹{availableWalletBalance.toFixed(2)}</span>
              <span className={styles.balanceLabel}>Available</span>
            </div>
          </div>

          {/* Deposit Input (Coins) */}
          <div className={styles.amountSection}>
            <h3>Deposit Amount</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="coinAmount">Coins to Deposit</label>
              <input
                type="number"
                id="coinAmount"
                value={coinAmount}
                onChange={handleCoinAmountChange}
                onWheel={(e) => e.target.blur()}
                placeholder="Enter coins"
                min="1"
                step="0.01"
                className={styles.input}
              />
            </div>
          </div>

          {/* Coin Conversion Info (Same Display as CreateId) */}
          {isAmountValid && (
             <div className={styles.conversionSection}>
                <h3>Conversion Details</h3>
                <div className={styles.conversionDisplay}>
                    
                    {/* Rate Breakdown */}
                    <div className={styles.conversionItem}>
                        <span className={styles.conversionLabel}>Applicable Rate:</span>
                        <span className={styles.conversionValue}>
                            {coins < 50000 ? (
                                <span style={{ fontSize: '0.9em' }}>
                                    {actualWebsiteRate || selectedId?.coinRate} + 0.03 = <b>₹{displayedRate}</b> <span style={{ color: 'var(--success-color)', fontSize: '0.8em' }}>(Rate increased for &lt; 50k coins)</span>
                                </span>
                            ) : coins < 100000 ? (
                                <span style={{ fontSize: '0.9em' }}>
                                    {actualWebsiteRate || selectedId?.coinRate} + 0.01 = <b>₹{displayedRate}</b> <span style={{ color: 'var(--success-color)', fontSize: '0.8em' }}>(Rate increased for &lt; 100k coins)</span>
                                </span>
                            ) : (
                                <span>1 coin = ₹{displayedRate}</span>
                            )}
                        </span>
                    </div>

                    {/* Calculation */}
                    <div className={styles.conversionItem}>
                        <span className={styles.conversionLabel}>Total Cost:</span>
                        <span className={styles.conversionValue}>
                            {coins} x {displayedRate}
                            {coins < 50000 && <span style={{fontSize: '0.8em', color: 'var(--success-color)', margin: '0 5px'}}>(+0.03 rate applied)</span>}
                            {coins >= 50000 && coins < 100000 && <span style={{fontSize: '0.8em', color: 'var(--success-color)', margin: '0 5px'}}>(+0.01 rate applied)</span>}
                            = <b>₹{convertedRupees.toFixed(2)}</b>
                        </span>
                    </div>
                </div>
            </div>
          )}

          {/* Validation Messages */}
          {isAmountValid && (
            <div className={styles.validationSection}>
              {!hasSufficientBalance && (
                <div className={styles.warningMessage}>
                  ⚠️ Insufficient wallet balance. You need ₹{convertedRupees.toFixed(2)}.
                </div>
              )}
               {coins < minimumCoins && (
                <div className={styles.warningMessage}>
                   ⚠️ Minimum deposit is {minimumCoins} coins.
                </div>
              )}
              {hasSufficientBalance && coins >= minimumCoins && (
                <div className={styles.successMessage}>
                  ✅ request is valid.
                </div>
              )}
            </div>
          )}

          {/* Refundable Option */}
          <div className={styles.refundableSection}>
            <h3>Deposit Type</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="refundable"
                  value="refundable"
                  checked={refundable === "refundable"}
                  onChange={(e) => setRefundable(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  <strong>Refundable</strong>
                  <small>You can request a refund of this deposit</small>
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="refundable"
                  value="non-refundable"
                  checked={refundable === "non-refundable"}
                  onChange={(e) => setRefundable(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  <strong>Non-Refundable</strong>
                  <small>This deposit cannot be refunded</small>
                </span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </div>

        {/* Submit Button Container */}
        <div className={styles.submitButtonContainer}>
          <button 
            className={styles.submitButton} 
            onClick={handleDeposit}
            disabled={isSubmitting || !isAmountValid || !hasSufficientBalance || coins < minimumCoins}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
