const { Server } = require('socket.io');

let io = null;

function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Emit an event to every connected client (kitchen screen, cashier, waiter tablets, etc.)
function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}

module.exports = { initSockets, broadcast };
