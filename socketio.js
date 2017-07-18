module.exports = (io) => {
  const host = io.of('/host');
  const screen = io.of('/screen');
  const rater = io.of('/rater');

  host.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
    // 开始抽签
    socket.on('draw', () => {
      screen.emit('draw');
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
    socket.on('disconnect', () => {
    });
    // 抽签完成
    socket.on('drawn', () => {
      rater.emit('drawn');
      host.emit('drawn');
    });
    // 该参赛作品评分结束
    socket.on('endParticipant', () => {
      host.emit('endParticipant');
      rater.emit('endParticipant');
    });
  });

  rater.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
    // 评分结束
    socket.on('endScore', (score) => {
      screen.emit('endScore', score);
      host.emit('endScore', score);
    });
  });
};
