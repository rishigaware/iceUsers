/**
 * Format an amount as Indian Rupee (INR) currency.
 * @param {number|string} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the ₹ symbol
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  const parsedAmount = parseFloat(amount) || 0;
  
  if (includeSymbol) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parsedAmount);
  }
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsedAmount);
};
