const router = require('express').Router();
// const checkNotLogin = require('../middlewares/check').checkNotLogin;
// const checkLogin = require('../middlewares/check').checkLogin;

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
