const router = require('express').Router();
// const checkNotLogin = require('../middlewares/check').checkNotLogin;
// const checkLogin = require('../middlewares/check').checkLogin;

// GET /enroll
router.get('/', (req, res, next) => {
  res.render('host/index');
});

module.exports = router;
