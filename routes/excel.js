const router = require('express').Router()
var nodeExcel = require('excel-export')
const participantModels = require('../lib/mongo').Participant
const scoreModels = require('../lib/mongo').Score

// GET /excel/order 获取抽签顺序
router.get('/order', function (req, res) {
  const competitionId = req.query.competitionId

  participantModels
    .find({competition: competitionId})
    .sort({order: 1})
    .exec()
    .then(participants => {
      let conf = {
        name: 'order',
        cols: [
          {
            caption: '上场顺序',
            type: 'number'
          }, {
            caption: '参赛小组',
            type: 'string',
            width: 30
          }
        ]
      }
      conf.rows = []
      for (var participant of participants) {
        let oneParticipant = []
        oneParticipant.push(participant.order, participant.name)
        conf
          .rows
          .push(oneParticipant)
      }
      const result = nodeExcel.execute(conf)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats')
      res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx')
      res.end(result, 'binary')
    })
})

// GET /excel/score 成绩表
router.get('/score', function (req, res) {
  const competitionId = req.query.competitionId

  participantModels
    .find({competition: competitionId})
    .sort({order: 1})
    .exec()
    .then((participants) => {
      const promises = participants.map((participant) => {
        return scoreModels
          .find({competition: competitionId, participant: participant.id})
          .populate('participant')
          .populate('rater')
          .sort({_id: 1})
          .exec()
      })
      promises.unshift(participants)
      return Promise.all(promises)
    })
    .then((results) => {
      const participants = results.shift()
      let conf = {
        name: 'order',
        cols: [
          {
            caption: '上场顺序',
            type: 'number'
          }, {
            caption: '参赛小组',
            type: 'string',
            width: 30
          }, {
            caption: '一号评委',
            type: 'number'
          }, {
            caption: '二号评委',
            type: 'number'
          }, {
            caption: '三号评委',
            type: 'number'
          }, {
            caption: '四号评委',
            type: 'number'
          }, {
            caption: '五号评委',
            type: 'number'
          }, {
            caption: '六号评委',
            type: 'number'
          }, {
            caption: '七号评委',
            type: 'number'
          }, {
            caption: '最终分数',
            type: 'number'
          }
        ]
      }
      conf.rows = []
      for (var participant of participants) {
        let oneParticipant = []
        oneParticipant.push(participant.order, participant.name)
        const scoresArray = results.shift()
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
          oneParticipant[raterSort + 2] = sum
        })
        oneParticipant[9] = participant.score
        conf
          .rows
          .push(oneParticipant)
      }
      const result = nodeExcel.execute(conf)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats')
      res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx')
      res.end(result, 'binary')
    })
})

module.exports = router
