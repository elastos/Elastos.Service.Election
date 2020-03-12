var ElaIndexService = require('./../service/elaIndexService');

var initTask = {

    init : function() {
        ElaIndexService.readElaIndex();
    }

}

module.exports = initTask;