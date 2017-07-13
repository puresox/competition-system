const router = require('express').Router();
const checkLogin = require('../../middlewares/check').checkLogin;
const checkHost = require('../../middlewares/check').checkHost;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;

// GET /api/hosts/status
router.get('/status', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition._id;

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
      if (participantScore) {
        score = participantScore.status;
      }
      res.send({
        status: 'success',
        message: {
          participants,
          status,
          participant,
          score,
        },
      });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

module.exports = router;
