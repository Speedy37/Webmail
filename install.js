var db = require("./lib/db");

var chainer = new db.QueryChainer();

for (var i = db.tables.length-1; i >= 0; --i) {
  chainer.add(db.tables[i], 'drop', []);
}

for (var i = 0, j = db.tables.length; i < j; ++i) {
  chainer.add(db.tables[i], 'sync', []);
}

chainer.runSerially({
  skipOnError: true
}).success(function() {
  db.users.create({
    username: 'Speedy37',
    password: "test"
  }).success(function(user) {
    db.mailboxes.create({
      UserId : user.id,
      "user": "vincent.rouille@gmail.com",
      "password": "ulviqowdhwqpyrph",
      "host": "imap.gmail.com",
      "port": 993,
      "tls": true
    }).success(function() {
      console.log("Install done");
    });
  });
}).error(function(err) {
  console.log("Install failed : " + err);
});
