const express = require('express');
const checkLogin = require('../middlewares/check').checkLogin;

const router = express.Router();

// GET /index
router.get('/', checkLogin, (req, res, next) => {
  res.render('index');
});

module.exports = router;
