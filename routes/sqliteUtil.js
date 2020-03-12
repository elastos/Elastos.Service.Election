var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var CommonUtils = require('./../util/commonUtils');
var ConstantMessagePara = require('./../constant/constantMessagePara');
var DB = DB || {};
 
DB.SqliteDB = function(file){
    DB.db = new sqlite3.Database(file);
 
    DB.exist = fs.existsSync(file);
    if(!DB.exist){
        console.log("Creating db file!");
        fs.openSync(file, 'w');
    };
};
 
DB.printErrorInfo = function(err){
    console.log("Error Message:" + err.message + " ErrorNumber:" + errno);
};
 
DB.SqliteDB.prototype.createTable = function(sql){
    DB.db.serialize(function(){
        DB.db.run(sql, function(err){
            if(null != err){
                DB.printErrorInfo(err);
                return;
            }
        });
    });
};
 
/// tilesData format; [level, column, row, content]
DB.SqliteDB.prototype.insertData = function(sql, objects,res){
    
    DB.db.serialize(function(){
        var stmt = DB.db.prepare(sql);
        // for(var i = 0; i < objects.length; ++i){
        stmt.run(objects,function(err){
            console.log(err);
            if(null != err){
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00002, null, null));
            }else{
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00001, null, null));
            }
            
        });
        // }
        stmt.finalize();
    });
};

DB.SqliteDB.prototype.updateData = function(sql, objects,res){
    
    DB.db.serialize(function(){
        var stmt = DB.db.prepare(sql);
        // for(var i = 0; i < objects.length; ++i){
        stmt.run(objects,function(err){
            // console.log(err);
            if(null != err){
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00003, null, null));
            }else{
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00004, null, null));
            }
            
        });
        // }
        stmt.finalize();
    });
};
 
DB.SqliteDB.prototype.queryData = function(sql, callback){
    DB.db.all(sql, function(err, rows){
        if(null != err){
            DB.printErrorInfo(err);
            return;
        }
 
        /// deal query data.
        if(callback){
            callback(rows);
        }
    });
};
 
DB.SqliteDB.prototype.executeSql = function(sql){
    DB.db.run(sql, function(err){
        if(null != err){
            DB.printErrorInfo(err);
        }
    });
};
 
DB.SqliteDB.prototype.close = function(){
    DB.db.close();
};
 
/// export SqliteDB.
exports.SqliteDB = DB.SqliteDB;