const router = require('express').Router();
const scoreModels = require('../../lib/mongo').Score;
const itemModels = require('../../lib/mongo').Item;
const competitionModels = require('../../lib/mongo').Competition;
const participantModels = require('../../lib/mongo').Participant;
const checkLogin = require('../../middlewares/check').checkLogin;
const checkRater = require('../../middlewares/check').checkRater;

// GET /api/raters/status 获取状态
router.get('/status', checkLogin, checkRater, (req, res) => {
  const competitionId = req.session.user.competition._id;
  const raterId = req.session.user.id;
  async function getStatus() {
    const competition = await competitionModels
      .findById(competitionId)
      .exec();
    const participants = await participantModels
      .find({competition: competitionId})
      .sort({order: 1})
      .exec();
    const participantScore = participants.find(p => p.order === competition.participant);
    let score = 0;
    let participantId = '000000000000000000000000';
    if (participantScore) {
      score = participantScore.status;
      participantId = participantScore._id;
    }
    const scores = await scoreModels
      .find({competition: competitionId, rater: raterId})
      .populate('participant')
      .populate('scores.item')
      .sort({_id: 1})
      .exec();
    const items = await itemModels
      .find({competition: competitionId})
      .sort({_id: 1})
      .exec();
    return [
      scores,
      items,
      participantId,
      participants,
      competition.status,
      competition.participant,
      score
    ];
  }

  getStatus().then(([
    scores,
    items,
    participantId,
    participants,
    status,
    participant,
    score
  ]) => {
    const theScore = scores.find(s => s.participant._id.toString() === participantId.toString());
    let isscore = 0;
    if (theScore) {
      isscore = 1;
    }
    res.send({
      status: 'success',
      message: {
        // 所有作品信息
        participants,
        // 评分项
        items,
        // 该评委对各个参赛作品的评分
        scores,
        // 比赛状态
        status,
        // 正在进行的参赛作品
        participant,
        // 参赛作品的评分状态
        score,
        // 该评委对参赛作品是否评分
        isscore
      }
    });
  }).catch((error) => {
    res.send({status: 'error', message: error});
  });
});

// POST /api/raters/score 评分
router.post('/score', checkLogin, checkRater, (req, res) => {
  const competitionId = req.session.user.competition._id;
  const scores = JSON.parse(req.fields.scores);
  const raterId = req.session.user.id;

  competitionModels
    .findById(competitionId)
    .exec()
    .then(competition => participantModels.findOne({order: competition.participant, competition: competitionId}).exec())
    .then(({_id: participantId}) => Promise.all([
      scoreModels.find({competition: competitionId, participant: participantId, rater: raterId}),
      participantId
    ]))
    .then(([scoreArray, participantId]) => {
      if (scoreArray && scoreArray.length > 0) {
        throw new Error('您已评过分');
      }
      return scoreModels.create({competition: competitionId, participant: participantId, rater: raterId, scores});
    })
    .then(() => {
      res.send({status: 'success', message: {}});
    })
    .catch((error) => {
      res.send({
        status: 'error',
        message: (error.message)
          ? error.message
          : error
      });
    });
});

module.exports = router;