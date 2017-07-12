const router = require('express').Router();
const scoreModels = require('../../lib/mongo').Score;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;
const checkLogin = require('../../middlewares/check').checkLogin;
const checkRater = require('../../middlewares/check').checkRater;

// GET /api/raters/status
router.get('/status', checkLogin, checkRater, (req, res) => {
  const competitionId = req.session.user.competition;
  const raterId = req.session.user.id;

  competitionModels
    .findOne({ _id: competitionId })
    .exec()
    .then(({ status, participant }) => Promise.all([
      participantModels
        .findOne({ order: participant, competition: competitionId })
        .exec(),
      status,
      participant,
    ]))
    .then(([
      {
        _id: participantId,
        status: score,
      },
      status,
      participant,
    ]) => Promise.all([
      scoreModels
        .find({ participant: participantId, competition: competitionId, rater: raterId })
        .exec(),
      status,
      participant,
      score,
    ]))
    .then(([
      scores,
      status,
      participant,
      score,
    ]) => {
      let isscore;
      if (scores) {
        isscore = 1;
      } else {
        isscore = 0;
      }
      res.send({ status, participant, score, isscore });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

// GET /api/raters/participant?p=***
router.get('/participant', checkLogin, checkRater, (req, res) => {
  res.render('rater/index');
});

// GET /api/raters/score?p=***
router.get('/score', checkLogin, checkRater, (req, res) => {
  res.render('rater/index');
});

// GET /api/raters/raterScore?p=***
router.get('/raterScore', checkLogin, checkRater, (req, res) => {
  res.render('score/index');
});

// POST /api/raters/raterScore
router.post('/raterScore', checkLogin, checkRater, (req, res) => {
  scoreModels.create({ size: 'small' })
    .then((score) => {
      res.render('score/index');
    })
    .catch();
});

// POST /api/raters/judges
router.get('/judges', checkLogin, checkRater, (req, res) => {
  res.render('score/index_judges');
});

// GET /api/raters/refer
router.get('/refer', checkLogin, checkRater, (req, res) => {
  res.render('score/index_referee');
});

module.exports = router;
