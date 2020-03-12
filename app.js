var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var BigNumber = require('bignumber.js');

var CodeMessagePara = require('./constant/constantMessagePara');

var CommonUtils = require('./util/commonUtils');
var TimeTask = require('./schedule/timeTask');
var InitTask = require('./init/initTask');


var app = express();
var dposnodeCheckRouter = require('./routes/dposnodeCheck');

app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/dposnoderpc/check/', dposnodeCheckRouter);
app.use(function(req, res, next) {
    return res.json(CommonUtils.encloseJson(CodeMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_404_CODE,
        CodeMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99998, null, CodeMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99997));
});

app.use(function(err, req, res, next) {

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json(CommonUtils.encloseJson(CodeMessagePara.COOKIX_DPOS_NODE_DEFAULT_EXCEPTION_500_CODE,
        CodeMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_99995, null, String(err)));
});

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    RANGE:[-100, 100],
    FORMAT: {
        decimalSeparator: '.',
        prefix: '',
        groupSeparator: '',
        groupSize: 0,
        secondaryGroupSize: 0,
        fractionGroupSeparator: '',
        fractionGroupSize: 0,
        suffix: ''
    }
});

InitTask.init();
TimeTask.run();

module.exports = app;
