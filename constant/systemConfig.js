module.exports = Object.freeze({

    COOKIX_DPOS_NODE_SERVER_JSON_RPC_IP: process.env.RPC_IP || '127.0.0.1',

    COOKIX_DPOS_NODE_SERVER_JSON_RPC_PORT: process.env.RPC_PORT || '20336',

    COOIX_DPOS_NODE_SERVER_DID_RESOLVER: process.env.DID_RESOLVER || 'http://localhost:20606',

    COOIX_DPOS_NODE_SERVER_DID_AUTH: process.env.DID_AUTH || ''

});
