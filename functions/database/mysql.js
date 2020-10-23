var mysql = require('mysql');

var mysqlCon = mysql.createConnection({
  host : '52.204.119.95',
  user : 'root',
  password : 'w$YF2$1v*eKuz1',
  database : 'node'
});

module.exports = mysqlCon;
