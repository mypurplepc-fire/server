const morgan = require('morgan');

const logger = morgan(
  process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :response-time ms'
);

module.exports = logger;
