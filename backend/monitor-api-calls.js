const http = require('http');

let callCount = 0;
const startTime = Date.now();

// Monitor API calls
const server = http.createServer((req, res) => {
  callCount++;
  const timestamp = new Date().toISOString();
  const elapsed = (Date.now() - startTime) / 1000;
  
  console.log(`[${timestamp}] API Call #${callCount} - ${req.method} ${req.url} (${elapsed.toFixed(1)}s elapsed)`);
  
  // If we get more than 10 calls in 10 seconds, it's likely infinite
  if (callCount > 10 && elapsed < 10) {
    console.log(`⚠️  WARNING: ${callCount} API calls in ${elapsed.toFixed(1)} seconds - possible infinite loop!`);
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'API call logged', count: callCount }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`API Monitor running on port ${PORT}`);
  console.log('Monitor the main server on port 3000 for actual API calls');
});
