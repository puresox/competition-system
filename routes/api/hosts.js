const router = require('express').Router();
const checkLogin = require('../../middlewares/check').checkLogin;
const checkHost = require('../../middlewares/check').checkHost;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;

// GET /api/hosts/status 获取状态
router.get('/status', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition._id;

  competitionModels
    .findById(competitionId)
    .exec()
    .then(({
      status = 0,
      participant = 0,
    }) => Promise.all([
      participantModels
        .find({ competition: competitionId })
        .exec(),
      status,
      participant,
    ]))
    .then(([participants, status, participant]) => {
      const participantScore = participants.find(p => p.order === participant);
      let score = 0;
      if (participantScore) {
        score = participantScore.status;
      }
      res.send({
        status: 'success',
        message: {
          // 所有作品信息
          participants,
          // 比赛状态
          status,
          // 正在进行的参赛作品
          participant,
          // 参赛作品的评分状态
          score,
        },
      });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

// POST /api/hosts/beginCompetition 开始比赛
router.post('/beginCompetition', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition._id;

  competitionModels.update({
    _id: competitionId,
  }, {
    $set: {
      status: 2,
      participant: 1,
    },
  })
    .exec()
    .then(() => {
      res.send({ status: 'success', message: {} });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

// POST /api/hosts/beginParticipant 参赛作品开始答辩
router.post('/beginParticipant', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition._id;

  competitionModels
    .findById(competitionId)
    .exec()
    .then((competition) => {
      const newCompetition = competition;
      newCompetition.participant += 1;
      return newCompetition.save();
    })
    .then(() => {
      res.send({ status: 'success', message: {} });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

// POST /api/hosts/beginScore 开始评分
router.post('/beginScore', checkLogin, checkHost, (req, res) => {
  const competitionId = req.session.user.competition._id;

  competitionModels
    .findById(competitionId)
    .exec()
    .then(competition => participantModels.update({
      order: competition.participant,
      competition: competitionId,
    }, {
      $set: {
        status: 1,
      },
    }).exec())
    .then(() => {
      res.send({ status: 'success', message: {} });
    })
    .catch((error) => {
      res.send({ status: 'error', message: error });
    });
});

module.exports = router;
