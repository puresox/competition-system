const moment = require('moment')

module.exports = (io) => {
  const host = io.of('/host')
  const screen = io.of('/screen')
  const rater = io.of('/rater')
  const countDown = io.of('/countDown')
  const management = io.of('/management')
  const ranking = io.of('/ranking')

  let countDownFlag

  const onlineCount = {
    host: 0,
    screen: 0,
    rater: 0,
    countDown: 0
  }

  host.on('connection', (socket) => {
    onlineCount.host += 1
    socket.on('disconnect', () => {
      onlineCount.host -= 1
      management.emit('updateCount', onlineCount)
    })
    management.emit('updateCount', onlineCount)
    // 开始自动抽签
    socket.on('autoDraw', () => {
      screen.emit('autoDraw')
    })
    // 显示一个
    socket.on('showOneDrawResult', () => {
      screen.emit('showOneDrawResult')
    })
    // 开始手动抽签
    socket.on('manuDraw', () => {
      screen.emit('manuDraw')
    })
    // 手动抽签完成
    socket.on('manuDrawn', () => {
      rater.emit('manuDrawn')
      screen.emit('manuDrawn')
    })
    // 开始展示参赛作品
    socket.on('nextParticipant', () => {
      screen.emit('nextParticipant')
      rater.emit('nextParticipant')
    })
    // 开始评分
    socket.on('beginScore', () => {
      screen.emit('beginScore')
      rater.emit('beginScore')
    })
    // 显示总分
    socket.on('showTotalScore', () => {
      screen.emit('showTotalScore')
    })
    // 结束比赛
    socket.on('end', () => {
      screen.emit('end')
      rater.emit('end')
    })
    // 倒计时
    socket.on('countDown', (minute) => {
      const minutes = moment(`0${minute}:00`, 'mm:ss')
      const intervalID = setInterval(animate, 1000)
      function animate () {
        minutes.subtract(1, 'seconds')
        countDown.emit('countDown', minutes.format('mm:ss'))
        if (minutes.format('mm:ss') === '00:00') {
          clearInterval(intervalID)
        }
      }
      socket.on('endCountDown', () => {
        clearInterval(intervalID)
        countDown.emit('countDown', '00:00')
      })
    })
    // 显示排名
    socket.on('showRanking', () => {
      screen.emit('showRanking')
    })
    // 隐藏排名
    socket.on('hideRanking', () => {
      screen.emit('hideRanking')
    })
    // 显示获奖信息
    socket.on('showWinners', () => {
      screen.emit('showWinners')
    })
  })

  screen.on('connection', (socket) => {
    onlineCount.screen += 1
    socket.on('disconnect', () => {
      onlineCount.screen -= 1
      management.emit('updateCount', onlineCount)
    })
    management.emit('updateCount', onlineCount)
    // 自动抽签完成
    socket.on('autoDrawn', () => {
      // rater.emit('autoDrawn');
      host.emit('autoDrawn')
    })
    // 该参赛作品评分结束
    socket.on('endParticipant', () => {
      host.emit('endParticipant')
      ranking.emit('updateRanking')
    })
  })

  rater.on('connection', (socket) => {
    onlineCount.rater += 1
    socket.on('disconnect', () => {
      onlineCount.rater -= 1
      management.emit('updateCount', onlineCount)
    })
    management.emit('updateCount', onlineCount)
    // 评分结束
    socket.on('endScore', (score) => {
      screen.emit('endScore', score)
      host.emit('endScore', score)
    })
  })

  countDown.on('connection', (socket) => {
    onlineCount.countDown += 1
    socket.on('disconnect', () => {
      onlineCount.countDown -= 1
      management.emit('updateCount', onlineCount)
    })
    management.emit('updateCount', onlineCount)
  })
}
