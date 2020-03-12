var path = require('path');
var fs = require('fs');
var BigNumber = require('bignumber.js');
var exec = require('child_process').exec;

var PythonConfig = require('./../constant/pythonConfig');
var ConstantPara = require('./../constant/constantPara');
var ConstantMessagePara = require('./../constant/constantMessagePara');
var GlobalMemoryVariable = require('./../constant/globalMemoryVariable');

var elaIndexService = {

    readElaIndex : function() {
        var jsonFilePath = path.join(__dirname, PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_JSON_RELATIVE_PATH).
        replace(PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_REPLACE_PATH,ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR);
        fs.readFile(jsonFilePath, 'utf-8', function(err, data) {
            if (err) {
                console.log(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00006);
            } else {
                try {
                    var elaIndexJson = JSON.parse(data);
                    GlobalMemoryVariable.COOKIX_DPOS_NODE_UNIQUE_VOTERS = new BigNumber(elaIndexJson["uniqueVoters"]);
                    GlobalMemoryVariable.COOKIX_DPOS_NODE_ELA_USED = new BigNumber(elaIndexJson["elaUsed"]);
                    GlobalMemoryVariable.COOKIX_DPOS_NODE_TOTAL_VOTES = new BigNumber(elaIndexJson["totalVotes"]);
                    GlobalMemoryVariable.COOKIX_DPOS_NODE_INITIAL_FLAG = ConstantPara.COOKIX_DPOS_NODE_DEFAULT_BOOLEAN_TRUE;
                    console.log(ConstantMessagePara.COOKIX_DPOS_NODE_DEFAULT_MESSAGE_00007);
                } catch (exception) {
                    console.error(exception);
                }
            }
        });
    },

    updateElaIndexData : function () {
        var pythonExePath = path.join(__dirname, PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_EXE_PATH).
        replace(PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_REPLACE_PATH,ConstantPara.COOKIX_DPOS_NODE_DEFAULT_EMPTY_STR);
        exec("python3 " + pythonExePath + ConstantPara.COOKIX_DPOS_NODE_DEFAULT_BLANK_STR + PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_LOG_PATH
            + ConstantPara.COOKIX_DPOS_NODE_DEFAULT_BLANK_STR + PythonConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PYTHON_JSON_RELATIVE_PATH ,function (execErr) {
            if(execErr){
                console.error('error: ' + execErr);
            } else {
                elaIndexService.readElaIndex();
            }
        });
    }
}

module.exports = elaIndexService;