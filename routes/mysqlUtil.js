var mysql  = require('mysql');
var CommonUtils = require('./../util/commonUtils');
var ConstantMessagePara = require('./../constant/constantMessagePara');

var db = mysql.createConnection({    
     host     : '54.223.244.60',      
     user     : 'admin',              
   // host: '3.1.106.18',
   // user: 'root',
    password : 'SHUJUkeji828!',      
    port: '3306',                  
    database: 'crinfo'
  });

db.connect();
exports.db = db;
