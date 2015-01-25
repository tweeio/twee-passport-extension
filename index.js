/**
 * Passport handlers installing
 */
module.exports.extension = function() {
    "use strict";

    var passport = require('passport')
        , app = twee.getApplication();

    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports.dependencies = {
    // Session is required for passport
    "Session": {
        "module": "twee-session-extension"
    }
};

module.exports.configNamespace = 'twee-passport';
module.exports.config = {};
