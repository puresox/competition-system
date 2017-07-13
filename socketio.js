const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio.listen(server);

  const host = io.of('/host');
  const screen = io.of('/screen');
  const rater = io.of('/rater');

  host.on('connection', (socket) => {
    // 抽签
    socket.on('drawn', () => {
      screen.emit('getStatus');
    });
    // 开始比赛
    socket.on('begin', () => {
      screen.emit('begin');
    });
  });

  screen.on('connection', (socket) => {
    socket.emit('chat message', 'hello master');
    screen.emit('chat message', 'system');
    socket.on('chat message', (msg) => {
      screen.emit('chat message', msg);
    });
  });

  rater.on('connection', (socket) => {
    socket.emit('chat message', 'hello master');
    rater.emit('chat message', 'system');
    socket.on('chat message', (msg) => {
      rater.emit('chat message', msg);
    });
  });
};
