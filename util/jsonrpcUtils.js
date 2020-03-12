var rpc = require('node-json-rpc');
var SystemConfig = require("./../constant/systemConfig");
var ConstantPara = require("./../constant/constantPara");

var options = {
    port: SystemConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_PORT,
    host: SystemConfig.COOKIX_DPOS_NODE_SERVER_JSON_RPC_IP,
    path: ConstantPara.COOKIX_DPOS_NODE_DEFAULT_JSON_PATH,
    strict: ConstantPara.COOKIX_DPOS_NODE_DEFAULT_BOOLEAN_TRUE
};

var jsonrpcClient = new rpc.Client(options);

var jsonRpcUtils = {

    getJsonRpcClient : function() {
        return jsonrpcClient;
    }

}

module.exports = jsonRpcUtils;