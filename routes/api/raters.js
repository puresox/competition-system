const router = require('express').Router();
const scoreModels = require('../../lib/mongo').Score;
const itemModels = require('../../lib/mongo').Item;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;
const checkLogin = require('../../middlewares/check').checkLogin;
const checkRater = require('../../middlewares/check').checkRater;

// GET /api/raters/status
router.get('/status', checkLogin, checkRater, (req, res) => {
  const competitionId = req.session.user.competition._id;
  const raterId = req.session.user.id;

  competitionModels
    .findOne({ _id: competitionId })
    .exec()
    .then(({
      status = 0,
      participant = 0,
    }) => Promise.all([
      participantModels
        .find({ competition: competitionId })
        .exec(),
      participantModels
        .findOne({ order: participant, competition: competitionId })
        .exec(),
      status,
      participant,
    ]))
    .then(([participants, participantScore, status, participant]) => {
      let score = 0;
      let participantId = '000000000000000000000000';
      if (participantScore) {
        score = participantScore.status;
        participantId = participantScore._id;
      }
      return Promise.all([
        scoreModels
          .find({ participant: participantId, competition: competitionId, rater: raterId })
          .exec(),
        itemModels
          .find({ competition: competitionId })
          .exec(),
        participants,
        status,
        participant,
        score,
      ]);
    })
    .then(([
      scores,
      items,
      participants,
      status,
      participant,
      score,
    ]) => {
      let isscore = 0;
      if (scores.length) {
        isscore = 1;
      }
      res.send({
        status: 'success',
        message: {
          participants,
          items,
          status,
          participant,
          score,
          isscore,
        },
      });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

// POST /api/raters/score/:participantId
router.post('/score/:participantId', checkLogin, checkRater, (req, res) => {
  const competitionId = req.session.user.competition._id;
  const participantId = req.params.participantId;
  const scores = req.fields.scores;
  const raterId = req.session.user.id;

  scoreModels
    .create({ competition: competitionId, participant: participantId, rater: raterId, scores })
    .exec()
    .then(() => {
      res.send({ status: 'success', message: {} });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

module.exports = router;
