const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkRater = require('../middlewares/check').checkRater;

// GET /rater
router.get('/', checkLogin, checkRater, (req, res) => {
  res.render('rater/index');
});

router.get('/pdf', checkLogin, checkRater, (req, res) => {
  res.render('pdf/viewer');
});

module.exports = router;
