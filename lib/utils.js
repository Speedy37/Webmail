exports.error = function(name, socket) {
  socket.emit('error', name);
};

exports.onerror = function(name, socket) {
  return function() {
    socket.emit('error', name);
  };
};