const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use('/api', apiLimiter);
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`[SERVER] Engineering Platform API running on port ${config.port}`);
  console.log(`[SERVER] Environment: ${config.env}`);
});

process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

module.exports = app;
