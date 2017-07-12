const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkRater = require('../middlewares/check').checkRater;

// GET /rater
router.get('/', checkLogin, checkRater, (req, res) => {
  const competition = req.session.user.competition;
  res.render('rater/index', { competition });
});

module.exports = router;
