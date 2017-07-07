const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkAdmin = require('../middlewares/check').checkAdmin;

// GET /manage
router.get('/', checkLogin, checkAdmin, (req, res, next) => {
  res.render('index');
});

module.exports = router;
