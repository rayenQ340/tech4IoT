const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logStream = fs.createWriteStream(
  path.join(logDir, 'requests.log'),
  { flags: 'a' } // 'a' means append to file
);

// Handle stream errors gracefully
logStream.on('error', (err) => {
  console.error('Logging error:', err);
});

module.exports = (req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  
  // Write to file (fail silently if error occurs)
  logStream.write(log, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
  
  // Also log to console
  console.log(log.trim());
  next();
};