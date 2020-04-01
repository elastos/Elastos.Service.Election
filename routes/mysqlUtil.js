var mysql = require('mysql');
var CommonUtils = require('./../util/commonUtils');
var ConstantMessagePara = require('./../constant/constantMessagePara');

var db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'crinfo'
});

db.connect();
exports.db = db;
