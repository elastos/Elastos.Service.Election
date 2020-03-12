var schedule = require('node-schedule');

var ConstantMessagePara = require('./../constant/constantMessagePara');
var ElaIndexService = require('./../service/elaIndexService');

var timeTask = {
    run : function() {
        var rule = new schedule.RecurrenceRule();
        rule.hour = [0, 4, 8, 12, 16, 20];  rule.minute = 1; rule.second = 1;
        schedule.scheduleJob(rule, function(){
            console.log(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00008);
            ElaIndexService.updateElaIndexData();
        });
    }
}

module.exports = timeTask;