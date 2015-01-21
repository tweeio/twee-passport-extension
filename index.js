/**
 * Passport handlers installing
 */
module.exports.extension = function() {
    "use strict";

    var passport = require('passport')
        , app = twee.getApplication();

    if (twee.getConfig('twee:options:passport:enabled')) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
};

module.exports.dependencies = {
    // Session is required for passport
    "Twee Session": {
        "module": "twee-session-extension"
    }
};
