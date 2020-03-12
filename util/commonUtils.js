var commonUtils = {

    encloseJson : function(code, message, dataObject, exceptionMsgInfo) {
        return {
            "code" : code,
            "message" : message,
            "data" : dataObject,
            "exceptionMsg" : exceptionMsgInfo,
            "msg" : message
        };
    },

    isNumber : function(dataObject) {
        if(dataObject == null) return false;
        return new RegExp("^[0-9]*$").test(dataObject);
    }

}

module.exports = commonUtils;