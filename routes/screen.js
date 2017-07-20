const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkScreen = require('../middlewares/check').checkScreen;

// GET /screen
router.get('/', checkLogin, checkScreen, (req, res) => {
  res.render('screen/index');
});

// GET /screen/ranking
router.get('/ranking', checkLogin, checkScreen, (req, res) => {
  res.render('screen/ranking');
});

// GET /screen/countDown
router.get('/countDown', checkLogin, checkScreen, (req, res) => {
  res.render('screen/countDown');
});

module.exports = router;
