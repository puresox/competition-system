const router = require('express').Router()
var nodeExcel = require('excel-export')
const participantModels = require('../lib/mongo').Participant

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
            type: 'string'
          }
        ],
        rows: []
      }
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

// GET /excel/reward 获奖名单
router.get('/reward', function (req, res) {
  const testexample = [
    {
      caption: '用户状态',
      type: 'string'
    }, {
      caption: '部门',
      type: 'string'
    }, {
      caption: '姓名',
      type: 'string'
    }, {
      caption: '邮箱',
      type: 'string'
    }, {
      caption: '有效期',
      type: 'string'
    }, {
      caption: '身份',
      type: 'string'
    }
  ]

  var conf = {}
  conf.name = 'mysheet'
  conf.cols = []
  for (var i = 0; i < testexample.length; i++) {
    var col = {}
    col.caption = testexample[i].caption
    col.type = testexample[i].type
    conf
      .cols
      .push(col)
  }
  conf.rows = [
    [
      'q',
      'q',
      'q',
      'q',
      'q',
      'q'
    ]
  ]
  var result = nodeExcel.execute(conf)

  res.setHeader('Content-Type', 'application/vnd.openxmlformats')
  res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx')
  res.end(result, 'binary')
})

module.exports = router
