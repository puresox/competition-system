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
    // 开始展示
    socket.on('nextParticipant', () => {
      screen.emit('getStatus');
      rater.emit('getStatus');
    });
    // 开始评分
    socket.on('score', () => {
      screen.emit('getStatus');
      rater.emit('getStatus');
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
      host.emit('getStatus');
      rater.emit('getStatus');
    });
  });

  rater.on('connection', (socket) => {
    // 评分结束
    socket.on('endScore', () => {
      screen.emit('getStatus');
      host.emit('getStatus');
    });
  });
};
