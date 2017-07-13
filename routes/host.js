const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkHost = require('../middlewares/check').checkHost;

// GET /host
router.get('/', checkLogin, checkHost, (req, res) => {
  res.render('host/index');
});

module.exports = router;
