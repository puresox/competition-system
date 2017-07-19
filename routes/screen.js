const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkScreen = require('../middlewares/check').checkScreen;

// GET /screen
router.get('/', checkLogin, checkScreen, (req, res) => {
  res.render('screen/index');
});

// GET /screen/ranking
router.get('/', checkLogin, checkScreen, (req, res) => {
  res.render('screen/ranking');
});

module.exports = router;
