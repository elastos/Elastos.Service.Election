module.exports = Object.freeze({
    //dev
    COOKIX_DPOS_NODE_SERVER_JSON_RPC_IP: process.env.RPC_IP || "127.0.0.1",

    COOKIX_DPOS_NODE_SERVER_JSON_RPC_PORT: process.env.RPC_PORT || "22336",

    COOIX_DPOS_NODE_SERVER_DID_RESOLVER: process.env.DID_RESOLVER || "http://api.elastos.io:22606",

    COOIX_DPOS_NODE_SERVER_DID_AUTH: process.env.DID_AUTH || "Basic ZGlkOnRlc3RuZXQtZGlk",

    //test
    // COOKIX_DPOS_NODE_SERVER_JSON_RPC_IP : "127.0.0.1",

    // COOKIX_DPOS_NODE_SERVER_JSON_RPC_PORT : "21336"
});
