const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkAdmin = require('../middlewares/check').checkAdmin;
const competitionModels = require('../lib/mongo').Competition;
const userModels = require('../lib/mongo').User;

// GET /manage
router.get('/', checkLogin, checkAdmin, (req, res) => {
  competitionModels.find({}, (err, competitions) => {
    req.flash('error', err);
    res.render('manage/index', { competitions });
  });
});

// GET /manage/:competitionId/hosts
router.get('/:competitionId/hosts', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  userModels.find({
    role: 1,
    competition: competitionId,
  }, 'name', (err, raters) => {
    req.flash('error', err);
    res.render('manage/hosts', { raters });
  });
});

module.exports = router;
