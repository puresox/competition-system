const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkHost = require('../middlewares/check').checkHost;

// GET /screen
router.get('/', checkLogin, checkHost, (req, res) => {
  const competition = req.session.user.competition;
  res.render('screen/index', { competition });
});

module.exports = router;
