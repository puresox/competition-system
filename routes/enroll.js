const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkHost = require('../middlewares/check').checkHost;
const participantModels = require('../lib/mongo').Participant;

// GET /enroll
router.get('/', checkLogin, checkHost, (req, res) => {
  const competition = req.session.user.competition;

  participantModels.find({
    competition,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('enroll', { participants, competition });
  });
});

// GET /enroll
router.get('/', checkLogin, checkHost, (req, res) => {
  const competition = req.session.user.competition;

  participantModels.find({
    competition,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('enroll', { participants, competition });
  });
});

module.exports = router;
