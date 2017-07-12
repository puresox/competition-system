const router = require('express').Router();
const checkLogin = require('../../middlewares/check').checkLogin;
const checkHost = require('../../middlewares/check').checkHost;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;

// GET /api/hosts/status
router.get('/status', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition;

  competitionModels
    .findOne({ _id: competitionId })
    .exec()
    .then(({ status, participant }) => Promise.all([
      participantModels
        .find({ competition: competitionId })
        .exec(),
      participantModels
        .findOne({ order: participant, competition: competitionId })
        .exec(),
      status,
      participant,
    ]))
    .then(([
      participants,
      {
        status: score,
      },
      status,
      participant,
    ]) => {
      res.send({ participants, status, participant, score });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

module.exports = router;
