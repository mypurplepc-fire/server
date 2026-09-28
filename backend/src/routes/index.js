const express = require('express');
const healthRouter = require('./health');
const authRouter = require('./auth');
const usersRouter = require('./users');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);

module.exports = router;
