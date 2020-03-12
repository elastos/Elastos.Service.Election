var BigNumber = require('bignumber.js');

var globalMemoryVariable = {

    COOKIX_DPOS_NODE_UNIQUE_VOTERS : new BigNumber(-1),

    COOKIX_DPOS_NODE_ELA_USED : new BigNumber(-1),

    COOKIX_DPOS_NODE_TOTAL_VOTES : new BigNumber(-1),

    COOKIX_DPOS_NODE_INITIAL_FLAG : false

}

module.exports = globalMemoryVariable;