const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio.listen(server);

  const host = io.of('/host');
  const screen = io.of('/screen');
  const rater = io.of('/rater');

  host.on('connection', (socket) => {
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
  });

  screen.on('connection', (socket) => {
    // 抽签完成
    socket.on('drawn', () => {
      rater.emit('drawn');
      host.emit('drawn');
    });
    // 评分结束
    socket.on('endParticipant', () => {
      host.emit('endParticipant');
      rater.emit('endParticipant');
    });
  });

  rater.on('connection', (socket) => {
    // 评分结束
    socket.on('endScore', (score) => {
      screen.emit('getStatus', score);
      host.emit('getStatus', score);
    });
  });
};
