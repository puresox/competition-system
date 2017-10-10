const router = require('express').Router()
const competitionModels = require('../../lib/mongo').Competition
const participantModels = require('../../lib/mongo').Participant
const scoreModels = require('../../lib/mongo').Score
const userModels = require('../../lib/mongo').User
const checkLogin = require('../../middlewares/check').checkLogin
const checkScreen = require('../../middlewares/check').checkScreen

// GET /api/screen/status 获取状态
router.get('/status', checkLogin, (req, res) => {
  const competitionId = req.session.user.competition._id

  competitionModels
    .findById(competitionId)
    .exec()
    .then(({
      status = 0,
      participant = 0
    }) => Promise.all([
      participantModels
        .find({competition: competitionId})
        .sort({order: 1})
        .exec(),
      status,
      participant
    ]))
    .then(([participants, status, participant]) => {
      const participantScore = participants.find(p => p.order === participant)
      let score = 0
      let participantId = '000000000000000000000000'
      if (participantScore) {
        score = participantScore.status
        participantId = participantScore._id
      }
      return Promise.all([
        participants,
        scoreModels
          .find({competition: competitionId, participant: participantId})
          .populate('participant')
          .populate('rater')
          .sort({_id: 1})
          .exec(),
        userModels
          .count({role: 2, competition: competitionId})
          .exec(),
        status,
        participant,
        score
      ])
    })
    .then(([
      participants,
      scoresArray,
      ratersNum,
      status,
      participant,
      score
    ]) => {
      const scores = []
      scoresArray.forEach((raterScore) => {
        let sum = 0
        raterScore
          .scores
          .forEach((itemScore) => {
            sum += itemScore.score
          })
        const raterName = raterScore
          .rater
          .name
          .split('')
        const raterSort = raterName.pop()
        scores[raterSort] = sum
      })
      res.send({
        status: 'success',
        message: {
          // 所有作品信息
          participants,
          // 各个评委对参赛作品的评分
          scores,
          // 评委数
          ratersNum,
          // 比赛状态
          status,
          // 正在进行的参赛作品
          participant,
          // 参赛作品的评分状态
          score
        }
      })
    })
    .catch((error) => {
      res.send({status: 'error', message: error})
    })
})

// POST /api/screen/draw 自动抽签
router.post('/draw', checkLogin, checkScreen, (req, res) => {
  const competitionId = req.session.user.competition._id
  const participants = JSON.parse(req.fields.participants)

  const setOrder = (participants, i) => {
    participantModels.update({
      _id: participants[i].id
    }, {
      $set: {
        order: participants[i].order
      }
    })
      .exec()
      .then(() => {
        if (i === participants.length - 1) {
          return competitionModels.update({
            _id: competitionId
          }, {
            $set: {
              status: 1
            }
          })
            .exec()
            .then(() => participantModels.find({competition: competitionId}).sort({order: 1}).exec())
            .then(orderedParticipants => res.send({status: 'success', message: orderedParticipants}))
            .catch(error => res.send({status: 'error', message: error}))
        }

        setOrder(participants, i + 1)
      })
      .catch((err) => {
        res.send({status: 'error', message: err})
      })
  }
  setOrder(participants, 0)
})

// POST /api/screen/score 评分结束
router.post('/score', checkLogin, checkScreen, (req, res) => {
  const competitionId = req.session.user.competition._id

  competitionModels
    .findById(competitionId)
    .exec()
    .then(competition => participantModels.find({competition: competitionId, order: competition.participant}).exec())
    .then(([participant]) => Promise.all([
      userModels
        .count({role: 2, competition: competitionId})
        .exec(),
      scoreModels
        .find({competition: competitionId, participant: participant._id})
        .exec(),
      participant
    ]))
    .then(([ratersNum, scoresArray, participant]) => {
      if (!scoresArray && ratersNum !== scoresArray.length) {
        throw new Error('还有评委未打分')
      }

      const scores = []
      scoresArray.forEach((raterScore) => {
        let sum = 0
        raterScore
          .scores
          .forEach((itemScore) => {
            sum += itemScore.score
          })
        scores.push(sum)
      })
      let score = 0
      scores.forEach((s) => {
        score += s
      })
      score /= scoresArray.length

      const newParticipant = participant

      newParticipant.status = 2
      newParticipant.score = score.toFixed(2)

      return newParticipant.save()
    })
    .then((newParticipant) => {
      res.send({status: 'success', message: newParticipant})
    })
    .catch((error) => {
      res.send({
        status: 'error',
        message: (error.message)
          ? error.message
          : error
      })
    })
})

module.exports = router
