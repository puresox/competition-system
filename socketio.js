module.exports = (io) => {
  const host = io.of('/host');
  const screen = io.of('/screen');
  const rater = io.of('/rater');
  const ranking = io.of('/ranking');

  host.on('connection', (socket) => {
    socket.on('disconnect', () => {});
    // 开始自动抽签
    socket.on('autoDraw', () => {
      screen.emit('autoDraw');
    });
    // 开始手动抽签
    socket.on('manuDraw', () => {
      screen.emit('manuDraw');
    });
    // 手动抽签完成
    socket.on('manuDrawn', () => {
      rater.emit('manuDrawn');
      screen.emit('manuDrawn');
    });
    // 开始展示参赛作品
    socket.on('nextParticipant', () => {
      screen.emit('nextParticipant');
      rater.emit('nextParticipant');
    });
    // 开始评分
    socket.on('beginScore', () => {
      screen.emit('beginScore');
      rater.emit('beginScore');
    });
    // 结束比赛
    socket.on('end', () => {
      screen.emit('end');
      rater.emit('end');
    });
  });

  screen.on('connection', (socket) => {
    socket.on('disconnect', () => {});
    // 自动抽签完成
    socket.on('autoDrawn', () => {
      rater.emit('autoDrawn');
      host.emit('autoDrawn');
    });
    // 该参赛作品评分结束
    socket.on('endParticipant', () => {
      host.emit('endParticipant');
      rater.emit('endParticipant');
    });
    // 排名更新
    socket.on('updateRank', () => {
      ranking.emit('updateRank');
    });
  });

  rater.on('connection', (socket) => {
    socket.on('disconnect', () => {});
    // 评分结束
    socket.on('endScore', (score) => {
      screen.emit('endScore', score);
      host.emit('endScore', score);
    });
  });
};
