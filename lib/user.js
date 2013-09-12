var db = require("./db");
var utils = require("./utils");
var MemoryStore = require("./memorystore");
var crypto = require("crypto");

/**
 * Map of currently logged in users : id -> User
 */
var users = new MemoryStore();

/**
 * Map of current sessions : session_id -> { user: User, creationTime : int }
 */
var sessions = new MemoryStore();

/**
 * Login a user
 * @param string username
 * @param string password
 * @param Socket socket
 */
exports.login = function(username, password, socket) {
  db.users.find({
    where: {
      username: username
    }
  }).success(function(dbUser) {
    if (dbUser === null) {
      utils.error("bad-username", socket);
    }
    else if (dbUser.checkPassword(password)) {
      users.get(dbUser.id, function(user) {
        user.addConnection(socket);
      }, function() {
        new User(dbUser, socket);
      });
    }
    else {
      utils.error("bad-password", socket);
    }
  }).error(utils.onerror("bad-username", socket));
};

/**
 * Link a socket to the user using the authentication_key
 * @return the corresponding User
 */
exports.session = function(authentication_key, socket) {

};


/**
 * Contructor of a newly connected user
 *  - Create connections to mailboxes
 */
function User(dbUser, socket) {
  var user = this;

  this.sockets = [];
  this.dbUser = dbUser;
  this.dbMailboxes = [];

  this.addConnection(socket);

  dbUser.getMailBoxes().success(function(dbMailboxes) {
    user.dbMailboxes = dbMailboxes;
  }).error(utils.onerror("mailboxes-load-failed", socket));

  users.set(dbUser.id, this);
}

User.prototype.disconnect = function() {
  users.remove(this.dbUser.id);
};

/**
 *
 */
User.prototype.addConnection = function(socket) {
  var user = this;
  var sockets = this.sockets;
  sockets.push(socket);
  socket.on('disconnect', function() {
    for(var i = 0, j = sockets.length; i < j; ++i) {
      if(sockets[i] === socket) {
        sockets.splice(i, 1);
        break;
      }
    }
    if(sockets.length === 0) {
      user.disconnect();
    }
  });

  crypto.randomBytes(64, function(ex, buf) {
    if (ex) {
      socket.emit("error", "sessionid-generation-failed");
    } else {
      socket.emit("logged-in", {
        username : user.dbUser.username,
        session_id : buf.toString("base64")
      });
    }
  });
};

/**
 * Notifiy all connected clients of this user about something
 */
User.prototype.emit = function(event_name, data) {
  for (var i = 0, j = this.sockets.length; i < j; ++i) {
    var socket = this.sockets[i];
    socket.emit(event_name, data);
  }
};

User.prototype.createMailBox = function() {
  db.mailboxes.build({
      user: "vincent.rouille@gmail.com",
      password: "ulviqowdhwqpyrph",
      host: "imap.gmail.com",
      port: 993,
      tls: true}).setUser(this.dbUser).save();
};

User.prototype.removeMailBox = function() {
  // TODO
}