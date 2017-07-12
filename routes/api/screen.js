const router = require('express').Router();
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;

// GET /api/screen
router.get('/', (req, res) => {
  const competition = req.session.user.competition;
  res.render('screen/index', { competition });
});

// GET /api/screen/status
router.get('/status', (req, res) => {
  const competitionId = req.session.user.competition;

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
        status: score,
      },
      status,
      participant,
    ]) => {
      res.send({ status, participant, score });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

module.exports = router;
