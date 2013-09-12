var config = require('./config');
var User = require('./lib/user');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT, process.env.IP);

app.use(express.bodyParser());
app.use('/static', express.static(__dirname + '/static'));

io.sockets.on('connection', function(socket) {

  socket.on('login', function(data) {
    try {
      if(typeof data.username !== "string" || data.username.length === 0 || data.username.length >= 255)
        throw "bad-username";
      if(typeof data.password !== "string" || data.password.length === 0 || data.password.length >= 255)
        throw "bad-password";

      // Logging in
      User.login(data.username, data.password, socket);
    } catch(exception) {
      socket.emit('error', exception);
    }
  });

  socket.on('connect', function(data) {
    if(user !== null) {
      socket.emit('error', "already-logged-in");
    } else {
      User.session(data.session_id, socket);
    }
  });

});