const router = require('express').Router();
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;
const scoreModels = require('../../lib/mongo').Score;
const checkLogin = require('../../middlewares/check').checkLogin;
const checkScreen = require('../../middlewares/check').checkScreen;

// GET /api/screen/status 获取状态
router.get('/status', checkLogin, checkScreen, (req, res) => {
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
      let participantId = '000000000000000000000000';
      if (participantScore) {
        score = participantScore.status;
        participantId = participantScore._id;
      }
      return Promise.all([
        participants,
        scoreModels
          .find({ competition: competitionId, participant: participantId })
          .populate('participant')
          .exec(),
        status,
        participant,
        score,
      ]);
    })
    .then(([participants, scoresArray, status, participant, score]) => {
      const scores = scoresArray;
      scoresArray.forEach((raterScore, i) => {
        let sum = 0;
        raterScore
          .scores
          .forEach((itemScore) => {
            sum += itemScore;
          });
        scores[i].score = sum;
      });
      res.send({
        status: 'success',
        message: {
          // 所有作品信息
          participants,
          // 各个评委对参赛作品的评分
          scores,
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

// POST /api/screen/draw 抽签
router.post('/draw', checkLogin, checkScreen, (req, res) => {
  const competitionId = req.session.user.competition._id;
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

// POST /api/screen/score 评分结束
router.post('/score', checkLogin, checkScreen, (req, res) => {
  const competitionId = req.session.user.competition._id;
  const score = req.fields.score;

  competitionModels
    .findById(competitionId)
    .exec()
    .then(competition => participantModels.update({
      order: competition.participant,
      competition: competitionId,
    }, {
      $set: {
        status: 2,
        score,
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
