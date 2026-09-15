// API Call Limiter to prevent infinite API calls
class APILimiter {
  constructor() {
    this.callCounts = new Map();
    this.lastReset = Date.now();
    this.maxCallsPerMinute = 10; // Maximum 10 calls per minute per endpoint
  }

  canMakeCall(endpoint) {
    const now = Date.now();
    
    // Reset counters every minute
    if (now - this.lastReset > 60000) {
      this.callCounts.clear();
      this.lastReset = now;
    }

    const key = endpoint;
    const count = this.callCounts.get(key) || 0;
    
    if (count >= this.maxCallsPerMinute) {
      console.warn(`API call limit exceeded for ${endpoint}. Blocking call.`);
      return false;
    }

    this.callCounts.set(key, count + 1);
    return true;
  }

  reset() {
    this.callCounts.clear();
    this.lastReset = Date.now();
  }
}

// Global API limiter instance
export const apiLimiter = new APILimiter();

// Helper function to make limited API calls
export const limitedFetch = async (url, options = {}) => {
  const endpoint = new URL(url).pathname;
  
  if (!apiLimiter.canMakeCall(endpoint)) {
    throw new Error(`API call limit exceeded for ${endpoint}`);
  }

  return fetch(url, options);
};
