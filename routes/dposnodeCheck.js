var express = require('express');
var BigNumber = require('bignumber.js');
var JsonRpcUtils= require('./../util/jsonrpcUtils');
var CommonUtils = require('./../util/commonUtils');
var path = require('path');
var crypto = require('crypto');
var http = require('http');
var fs = require('fs');
var request = require('request');
const jwt = require('jsonwebtoken');

var db = require('./mysqlUtil.js').db;
// var file = 'data.db';
// var db = new SqliteDB(file);
var ConstantMessagePara = require('./../constant/constantMessagePara');
var ConstantPara = require('./../constant/constantPara');
var GlobalMemoryVariable = require('./../constant/globalMemoryVariable');

var app = express();
app.use(express.static('public'));

var router = express.Router();

router.post('/jwtget', function(req, res, next) {
    try {
        var iss = req.body.iss;
        if(iss == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || iss == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00088, null, null));

        var sql = "SELECT * FROM didtoken WHERE json LIKE '%"+iss+"%' ORDER BY updatetime DESC LIMIT 1 ";
        db.query(sql,function(err,result){
            console.log(result[0].json);
            var re = JSON.parse(result[0].json);
            re.token = result[0].token;
            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, re, null));
        })

    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/jwtsave', function(req, res, next) {
    try{
        var code = req.body.code;

        var abc = JSON.parse(Buffer.from(code.split('.')[1], 'base64').toString());
        var json = Buffer.from(code.split('.')[1], 'base64').toString();

        var sql = "INSERT INTO didtoken (`json`, `token`) VALUES ('"+json+"', '"+code+"')";

        db.query(sql,function(err,result){
            if(err){
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_jwt_MESSAGE_00001, null, null));
                return;
            }

            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_jwt_MESSAGE_00002, null, null));
        });
    }catch(exception){
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/getimage', function(req, res, next) {
    try{
        var url = req.body.imageurl;
        var md5 = crypto.createHash('md5');
        var filename = md5.update(url).digest('hex');
        
        var imagePath = path.join(__dirname,'../public/images/');
        var prex = url.split(".");
        var file = path.join(imagePath,filename+'.'+prex[prex.length-1]);
        fs.readdir(file,function(err, files){
           if (err) {
               var stream = fs.createWriteStream(file);
               request(url).pipe(stream).on('end',function(){
                 
               });
               stream.on("finish", function() {
                   return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                        ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, 'images/'+filename+'.'+prex[prex.length-1], null));
                   stream.end();
               });
           }else{
               return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                        ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, 'images/'+filename+'.'+prex[prex.length-1], null));
           }
        }); 
    }catch(exception){
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/listcrcandidates', function(req, res, next) {
    try {
        var pageNum = req.body.pageNum;
        var pageSize = req.body.pageSize;
        var state = req.body.state;

        if(pageNum == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || pageNum == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR ||
            !CommonUtils.isNumber(pageNum) || pageNum < 0) pageNum = ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NUM_ONE;
        if(pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR ||
            !CommonUtils.isNumber(pageSize) || pageSize < 0) pageSize = ConstantPara.COOKIX_DPOS_NODE_DEFAULT_PAGE_SIZE;

        var jsonrpcPram = pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_PAGE_SIZE ?
            {"jsonrpc": "2.0", "method": "listcrcandidates", "params": { "start": ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NUM_ZERO,"state":state}} :
            {"jsonrpc": "2.0", "method": "listcrcandidates", "params": { "start": (pageNum - 1) * pageSize, "limit":  pageSize,"state":state}};

        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(jsonrpcPram, function (err, data) {
            if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
            else {
                if (data.result && data.result.crcandidatesinfo && data.result.crcandidatesinfo.length > 0) {
                    for (item of data.result.crcandidatesinfo) {
                        let temp = item.cid;
                        item.cid = item.did;
                        item.did = temp;
                    }
                }
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        });
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/listcurrentcrs', function(req, res, next) {
    try {
        var state = req.body.state;

        var jsonrpcPram = {"jsonrpc": "2.0", "method": "listcurrentcrs", "params": {"state":state}};

        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(jsonrpcPram, function (err, data) {
            if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
            else {
                if (data.result && data.result.crmembersinfo && data.result.crmembersinfo.length > 0) {
                    for (item of data.result.crmembersinfo) {
                        let temp = item.cid;
                        item.cid = item.did;
                        item.did = temp;
                    }
                }
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        });
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/listproducer', function(req, res, next) {
    try {
        var pageNum = req.body.pageNum;
        var pageSize = req.body.pageSize;
        var state = req.body.state;
        var moreInfo = req.body.moreInfo;
        if(state == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || state == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR){
            state = "all";
        }
        if(pageNum == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || pageNum == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR ||
            !CommonUtils.isNumber(pageNum) || pageNum < 0) pageNum = ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NUM_ONE;
        if(pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR ||
            !CommonUtils.isNumber(pageSize) || pageSize < 0) pageSize = ConstantPara.COOKIX_DPOS_NODE_DEFAULT_PAGE_SIZE;
        if(moreInfo != ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT && moreInfo != ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR && !CommonUtils.isNumber(moreInfo))
            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00004, null, null));

        var jsonrpcPram = pageSize == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_PAGE_SIZE ?
            {"jsonrpc": "2.0", "method": "listproducers", "params": { "state":state}} :
            {"jsonrpc": "2.0", "method": "listproducers", "params": { "start": (pageNum - 1) * pageSize, "limit": pageNum * pageSize,"state":state}};
        
        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(jsonrpcPram, function (err, data) {
            if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
            else {
                if(moreInfo == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || moreInfo == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR) {
                    res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                        ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
                } else if(moreInfo == 1){
                    modifyOriginalData(res, client, data);
                } else {
                    res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00002,
                        ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00005, null, null));
                }
            }
        });
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/adddidinfo', function(req, res, next) {
    try {
        var did = req.body.did;
        var name = req.body.name;
        var nickname = req.body.nickname;
        var sex = req.body.sex;
        var birthday = req.body.birthday;
        var url = req.body.url;
        var email = req.body.email;
        var areacode = req.body.areacode;
        var phone = req.body.phone;
        var contry = req.body.contry;
        var sumary = req.body.sumary;
        var website = req.body.website;
        var google = req.body.google;
        var microsoft = req.body.microsoft;
        var facebook = req.body.facebook;
        var twitter = req.body.twitter;
        var weibo = req.body.weibo;
        var wechat = req.body.wechat;
        var alipay = req.body.alipay;
        var sql = "insert into didinfo(";
        var cols = "";
        var qus = "";
        var i = 0;
        var params = [];

        if(did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
            return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00088, null, null));
        cols = "did,";
        qus = "?,";
        params[i] = did;
        if(name){
            cols = cols + "name,";
            qus = qus+"?,";
            i++;
            params[i] = name;
        }
        if(nickname){
            cols = cols + "nickname,";
           qus = qus+"?,";
           i++;
            params[i] = nickname;
        }
        if(sex){
            cols = cols + "sex,";
           qus = qus+"?,";
           i++;
            params[i] = sex;
        }
        if(birthday){
            cols = cols + "birthday,";
           qus = qus+"?,";
           i++;
            params[i] = birthday;
        }
        if(url){
            cols = cols + "url,";
           qus = qus+"?,";
           i++;
            params[i] = url;
        }
        if(email){
            cols = cols + "email,";
           qus = qus+"?,";
           i++;
            params[i] = email;
        }
        if(areacode){
            cols = cols + "areacode,";
           qus = qus+"?,";
           i++;
            params[i] = areacode;
        }
        if(phone){
            cols = cols + "phone,";
           qus = qus+"?,";
           i++;
            params[i] = phone;
        }
        if(contry){
            cols = cols + "contry,";
           qus = qus+"?,";
           i++;
            params[i] = contry;
        }
        if(sumary){
            cols = cols + "sumary,";
           qus = qus+"?,";
           i++;
            params[i] = sumary;
        }
        if(website){
            cols = cols + "website,";
           qus = qus+"?,";
           i++;
            params[i] = website;
        }
        if(google){
            cols = cols + "google,";
           qus = qus+"?,";
           i++;
            params[i] = google;
        }
        if(microsoft){
            cols = cols + "microsoft,";
           qus = qus+"?,";
           i++;
            params[i] = microsoft;
        }
        if(facebook){
            cols = cols + "facebook,";
           qus = qus+"?,";
           i++;
            params[i] = facebook;
        }
        if(twitter){
            cols = cols + "twitter,";
           qus = qus+"?,";
           i++;
            params[i] = twitter;
        }
        if(weibo){
            cols = cols + "weibo,";
           qus = qus+"?,";
           i++;
            params[i] = weibo;
        }
        if(wechat){
            cols = cols + "wechat,";
           qus = qus+"?,";
           i++;
            params[i] = wechat;
        }
        if(alipay){
            cols = cols + "alipay,";
           qus = qus+"?,";
           i++;
            params[i] = alipay;
        }

        sql = sql + cols + ") values("+qus+")";
        sql = sql.replace(/,\)/g,")");
        // console.log(sql)
        // console.log(params)
        // db.insertData(sql,params,res);
        db.query(sql,params,function(err,result){
            if(err){
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00002, null, null));
                return;
            }

            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00001, null, null));
        });

        
    } catch (error) {
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(error)));
    }
});

router.post('/updatedidinfo', function(req, res, next) {
    try {
        var did = req.body.did;
        var name = req.body.name;
        var nickname = req.body.nickname;
        var sex = req.body.sex;
        var birthday = req.body.birthday;
        var url = req.body.url;
        var email = req.body.email;
        var areacode = req.body.areacode;
        var phone = req.body.phone;
        var contry = req.body.contry;
        var sumary = req.body.sumary;
        var website = req.body.website;
        var google = req.body.google;
        var microsoft = req.body.microsoft;
        var facebook = req.body.facebook;
        var twitter = req.body.twitter;
        var weibo = req.body.weibo;
        var wechat = req.body.wechat;
        var alipay = req.body.alipay;
        if(did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
            return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00088, null, null));
        var sql = "update didinfo set ";
        var params = [];
        var i = 0;
        if(name){
            sql = sql + "name = ?,";
            params[i] = name;
            i++;
        }
        if(nickname){
            sql = sql + "nickname = ?,";
            params[i] = nickname;
            i++;
        }
        if(sex){
            sql = sql + "sex = ?,";
            params[i] = sex;
            i++;
        }
        if(birthday){
            sql = sql + "birthday = ?,";
            params[i] = birthday;
            i++;
        }
        if(url){
            sql = sql + "url = ?,";
            params[i] = url;
            i++;
        }
        if(email){
            sql = sql + "email = ?,";
            params[i] = email;
            i++;
        }
        if(areacode){
            sql = sql + "areacode = ?,";
            params[i] = areacode;
            i++;
        }
        if(phone){
            sql = sql + "phone = ?,";
            params[i] = phone;
            i++;
        }
        if(contry){
            sql = sql + "contry = ?,";
            params[i] = contry;
            i++;
        }
        if(sumary){
            sql = sql + "sumary = ?,";
            params[i] = sumary;
            i++;
        }
        if(website){
            sql = sql + "website = ?,";
            params[i] = website;
            i++;
        }
        if(google){
            sql = sql + "google = ?,";
            params[i] = google;
            i++;
        }        if(microsoft){
            sql = sql + "microsoft = ?,";
            params[i] = microsoft;
            i++;
        }        if(facebook){
            sql = sql + "facebook = ?,";
            params[i] = facebook;
            i++;
        }        if(twitter){
            sql = sql + "twitter = ?,";
            params[i] = twitter;
            i++;
        }        if(weibo){
            sql = sql + "weibo = ?,";
            params[i] = weibo;
            i++;
        }        if(wechat){
            sql = sql + "wechat = ?,";
            params[i] = wechat;
            i++;
        }        if(alipay){
            sql = sql + "alipay = ?,";
            params[i] = alipay;
            i++;
        }

        sql = sql + "WHERE did=?";
        sql = sql.replace(",WHERE"," WHERE");
        params[i] = did;
        // console.log(sql)
        // console.log(params)
        // db.updateData(sql,params,res);

        db.query(sql,params,function(err,result){
            if(err){
                res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00003, null, null));
                return;
            }

            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DID_MESSAGE_00004, null, null));
        });

    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/getdidinfo', function(req, res, next) {
    try {
        var did = req.body.did;
        if(did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00088, null, null));
        var sql = "select * from didinfo where did='"+did+"'";
        db.query(sql,function(err,result){

            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, result, null));
        })

    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/getalldidinfo', function(req, res, next) {
    try {
        var sql = "select * from didinfo";
        db.query(sql,function(err,result){
            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, result, null));
        })

    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/getcrdepositcoin', function(req, res, next) {
    try {
        var did = req.body.did;
        if(did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || did == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
            return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00088, null, null));
        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(
            {"jsonrpc": "2.0", "method": "getcrdepositcoin", "params": { "id": did}},
            function (err, data) {
                if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
                else res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        );
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/getdepositcoin', function(req, res, next) {
    try {
        var ownerpublickey = req.body.ownerpublickey;
        if(ownerpublickey == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || ownerpublickey == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
            return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00003, null, null));
        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(
            {"jsonrpc": "2.0", "method": "getdepositcoin", "params": { "ownerpublickey": ownerpublickey}},
            function (err, data) {
                if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
                else res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        );
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/producerstatus', function(req, res, next) {
    try {
        var publickey = req.body.publickey;
        if(publickey == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || publickey == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00003, null, null));
        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(
            {"jsonrpc": "2.0", "method": "producerstatus", "params": { "publickey": publickey}},
            function (err, data) {
                if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
                else res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        );
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

router.post('/votestatus', function(req, res, next) {
    try {
        var address = req.body.address;
        if(address == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NULL_OBEJCT || address == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR)
            return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_CODE_00001,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00002, null, null));
        var client = JsonRpcUtils.getJsonRpcClient();
        client.call(
            {"jsonrpc": "2.0", "method": "votestatus", "params": { "address": address}},
            function (err, data) {
                if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
                else res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
            }
        );
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
});

function modifyOriginalData(res, client, data) {
    try {
        var result = data["result"];
        if(result != null) {
            var totalvotes = result["totalvotes"];
            var producers = result["producers"];
            if(producers != null) {
                for(var i=0; i<producers.length; i++) {
                    producers[i]["voterate"] = totalvotes == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NUM_ZERO ?
                        String(ConstantPara.COOKIX_DPOS_NODE_DEFAULT_NUM_ZERO) : String(new BigNumber(producers[i]["votes"]).dividedBy(totalvotes).toFixed(15));
                }
                result["producers"] = producers;
            } else {
                result["producers"] = [];
            }
            getBlockCount(res, client, data);
        }
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
}

function getBlockCount(res, client, data) {
    try {
        var jsonrpcPram = {"jsonrpc": "2.0", "method": "getblockcount"};
        client.call(jsonrpcPram, function (err, result) {
            if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
            else {
                if(result != null && result["error"] == null) {
                    var blockHeight = String(new BigNumber(result["result"]).minus(1));
                    excludeSpecialAddress(res, client, data, blockHeight)
                } else {
                    return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                        ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(result["error"])));
                }
            }
        });
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
}

function excludeSpecialAddress(res, client, data, blockHeight) {
    try {
        var restArrs = new Array();
        ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EXCLUDE_SPECIAL_ADDRESSES.forEach(function(specialAddress) {
            var jsonrpcPram = {"jsonrpc": "2.0", "method": "getreceivedbyaddress",  "params" : {"address": specialAddress} };
            client.call(jsonrpcPram, function (err, result) {
                if(err) res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
                    ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(err)));
                else {
                    if(result != null) {
                        var restVal = new BigNumber(result["result"]);
                        restArrs.push(restVal);
                        if(restArrs.length == ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EXCLUDE_SPECIAL_ADDRESSES.length) {
                            var sum = new BigNumber(0);
                            for(var k=0; k<restArrs.length; k++) {
                                sum = sum.plus(new BigNumber(restArrs[k]));
                            }
                            if(GlobalMemoryVariable.COOKIX_DPOS_NODE_INITIAL_FLAG) {
                                data["result"]["totalvoterate"] = GlobalMemoryVariable.COOKIX_DPOS_NODE_ELA_USED.dividedBy(new BigNumber("33000000").
                                    plus(new BigNumber(blockHeight).multipliedBy("5.02283105")).minus(new BigNumber(sum))).toFixed(15);
                            } else {
                                data["result"]["totalvoterate"] = new BigNumber(String(data["result"]["totalvotes"])).dividedBy(new BigNumber("33000000").
                                    plus(new BigNumber(blockHeight).multipliedBy("5.02283105")).minus(new BigNumber(sum)).multipliedBy(30)).toFixed(15);
                            }
                            res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_SUCCESS_CODE,
                                ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00001, data, null));
                        }
                    }
                }
            });
        });
    } catch (exception) {
        console.error(exception.stack);
        return res.json(CommonUtils.encloseJson(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_CODE,
            ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99999, null, String(exception)));
    }
}

module.exports = router;