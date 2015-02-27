/**
 * Passport handlers installing
 */
module.exports.extension = function() {
    "use strict";

    if (twee.getConfig('twee:extension:twee-passport:disabled') === true) {
        return;
    }

    var passport = require('passport'),
        app = twee.getApplication();

    // Serializing returned data
    passport.serializeUser(function(user, done) {
        // Storing User
        twee.set('passport.serializeUser', user);

        // Emmit event
        twee.emit('passport.serializeUser');

        // Get modified user
        user = twee.get('passport.serializeUser');

        // Get error if exists
        var error = twee.get('passport.serializeError');

        // Calling callback
        done(error, user);
    });

    // Deserializing user data
    passport.deserializeUser(function (user, done) {
        // Saving User Object to Registry
        twee.set('passport.deserializeUser', user);

        // Emmit Event
        twee.emit('passport.deserializeUser');

        // Grab User Back
        user = twee.get('passport.deserializeUser');

        // Get the error if exists
        var error = twee.get('passport.deserializeError');

        // Call callback
        done(error, user);
    });

    var strategies = twee.getConfig('twee:extension:twee-passport:strategies', {})
        , strategyName;

    for (strategyName in strategies) {
        var strategy = strategies[strategyName];
        if (!strategy.module) {
            twee.error('Module missing in config for `' + strategyName + '` strategy! Skipping.');
            continue;
        }

        strategy.module = String(strategy.module);
        var strategyObject = require(strategy.module)
            , strategyLowerCasedName = strategyName.toLowerCase();

        switch (strategyLowerCasedName) {
            case 'digest':
                strategyObject = strategyObject.DigestStrategy;
                break;
            case 'basic':
                strategyObject = strategyObject.BasicStrategy;
                break;
            default:
                strategyObject = strategyObject.Strategy;
                break;
        }

        // HTTP Strategy Specific callback
        if (strategy.module === 'passport-http' && strategyLowerCasedName === 'digest') {
            var sName = strategyLowerCasedName;
            passport.use(new strategyObject(
                function(username, done) {
                    process.nextTick(function(){
                        twee.set('passport.Strategy.Data', {
                            strategy: sName,
                            username: username,
                            done: done
                        });

                        // Emmit strategy specific event
                        twee.emit('passport.Strategy.Digest.Callback');
                    })
                },
                function(params, done) {
                    process.nextTick(function(){
                        twee.set('passport.Strategy.Digest.Params', {
                            params: params,
                            done: done
                        });

                        // Emmit event for digest params check
                        // User required to call done according to passportjs API
                        twee.emit('passport.Strategy.Digest.Params');
                    })
                }
            ));
        } else if (strategy.module === 'passport-http' && strategyLowerCasedName === 'basic') {
            var sName = strategyLowerCasedName;
            passport.use(new strategyObject(
                function(username, password, done) {
                    process.nextTick(function () {
                        twee.set('passport.Strategy.Data', {
                            strategy: sName,
                            username: username,
                            password: password,
                            done: done
                        });

                        // Emmit event for basic strategy
                        // User required to call done according to passportjs API
                        twee.emit('passport.Strategy.Basic.Callback');
                    });
                }
            ));
        } else {
            var sName = strategyLowerCasedName
                , credentials = strategy.credentials;

            // All the rest of other strategies
            passport.use(new strategyObject(
                credentials,
                function() {
                    twee.set('passport.Strategy.Data', {
                        strategy: sName,
                        arguments: arguments,
                        done: arguments[arguments.length - 1]
                    });

                    // Emmit strategy specific event
                    twee.emit('passport.Strategy.' + strategyLowerCasedName);

                    // Emmit event for all strategies
                    twee.emit('passport.Strategy.Callback');
                }
            ));
        }
    }

    // We need to have possibility to use another strategies to be sat up in other extensions.
    // So lets wait until the needed moment come
    twee.emit('twee-passport-extension.strategiesInstalled');
    // Initializing Passport
    app.use(passport.initialize());
    app.use(passport.session());

    var redirects = twee.getConfig('twee:extension:twee-passport:redirects');
    // Setting Up Routes
    for (strategyName in strategies) {
        var strategy = strategies[strategyName]
            , strategyRedirectUrl = (strategy.urls && strategy.urls.redirect) || ''
            , strategyCallbackUrl = (strategy.urls && strategy.urls.callback) || ''
            , strategyLowerCasedName = strategyName.toLowerCase()
            , authUrlPattern = strategy.authUrlPattern || '';

        // Setup redirect route
        if (strategy.options && strategyRedirectUrl) {
            var options = strategy.options;
            app.all(strategyRedirectUrl, passport.authenticate(
                strategyLowerCasedName,
                options
            ));
        } else if (strategyRedirectUrl) {
            app.all(strategyRedirectUrl, passport.authenticate(strategyLowerCasedName));
        }

        if (strategyCallbackUrl) {
            // Setup callback route
            app.all(strategyCallbackUrl, passport.authenticate(
                strategyLowerCasedName,
                redirects
            ));
        } else if (authUrlPattern) {
            if (!authUrlPattern instanceof Array) {
                authUrlPattern = [authUrlPattern];
            }
            var options = strategy.options || {};
            for (var i = 0; i < authUrlPattern.length; i++) {
                app.all(authUrlPattern[i], passport.authenticate(
                    strategyLowerCasedName,
                    options
                ));
            }
        }
    }
    
    twee.emit('twee-passport-extension.strategiesRoutesInstalled');
};

module.exports.dependencies = {
    // Session is required for passport
    "Session": {
        "module": "twee-session-extension"
    }
};

module.exports.configNamespace = 'twee-passport';
module.exports.config = {};
