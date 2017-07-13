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
      participants, {
        status: score,
      },
      status,
      participant,
    ]) => {
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

// POST /api/hosts/draw
router.post('/draw', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition;
  const participants = JSON.parse(req.fields.participants);

  participants.forEach((participant, i) => {
    participantModels.update({
      _id: participant.id,
    }, {
      $set: {
        order: participant.order,
      },
    })
      .exec()
      .then(() => {
        if (i === participants.length - 1) {
          return competitionModels.update({
            _id: competitionId,
          }, {
            $set: {
              status: 1,
            },
          })
            .exec()
            .then(() => participantModels.find({ competition: competitionId }).exec())
            .then((orderedParticipants) => {
              res.send({ status: 'success', message: orderedParticipants });
            })
            .catch((error) => {
              res.send({ status: 'error', message: error });
            });
        }
      })
      .catch((err) => {
        res.send({ status: 'error', message: err });
      });
  });
});

module.exports = router;
