var Sequelize = require("sequelize");
var bcrypt = require('bcrypt');

/*var sequelize = new Sequelize('c9', 'speedy37', '', {
  // custom host; default: localhost
  //host: 'my.server.tld',
  dialect: 'mysql',
});*/
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

var Users = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING
}, {
  setterMethods   : {
    password : function(password) {
      var salt = bcrypt.genSaltSync(10);
      this.setDataValue('password', bcrypt.hashSync(password, salt));
    }
  },
  instanceMethods: {
    checkPassword: function(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
});

var MailBoxes = sequelize.define('MailBox', {
  type: Sequelize.ENUM('IMAP', 'POP3') ,
  name : Sequelize.STRING,
  host : Sequelize.STRING,
  port : Sequelize.INTEGER.UNSIGNED,
  user: Sequelize.STRING,
  password: Sequelize.STRING,
  tls: Sequelize.BOOLEAN
});

Users.hasMany(MailBoxes, {foreignKeyConstraint: true});
MailBoxes.belongsTo(Users);

exports.QueryChainer = Sequelize.Utils.QueryChainer;
exports.tables = [Users, MailBoxes];
exports.users = Users;
exports.mailboxes = MailBoxes;
exports.sequelize = sequelize;
