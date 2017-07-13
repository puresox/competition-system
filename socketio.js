const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio.listen(server);

  io.on('connection', (socket) => {
    socket
      .broadcast
      .emit('hi');
    io.emit('chat message', 'system:a user connected');
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
      io.emit('chat message', 'system:user disconnected');
    });
  });
};
