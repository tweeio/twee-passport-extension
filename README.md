# twee-passport-extension

![Twee.io Logo](https://raw.githubusercontent.com/tweeio/twee-framework/master/assets/68747470733a2f2f73332e65752d63656e7472616c2d312e616d617a6f6e6177732e636f6d2f6d657368696e2f7075626c69632f747765652e696f2e706e67.png)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tweeio/twee-framework?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm](https://img.shields.io/npm/dm/localeval.svg)](https://github.com/tweeio/twee-framework)
[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/tweeio/twee-framework)

Passport Extension for Twee.IO Framework - Modular Framework for Node.js and io.js based on Express.js.

Supported Strategies
==

__Supports__
 - Google
 - Twitter
 - Facebook
 - LinkedIn
 - ... all the usual `Strategy` variants.

Also supports `BasicStrategy` and `DigestStrategy` for `passport-http`.

All the other strategies could be added in future or added in middleware functions.


Before Installing into application `twee-passport-extension` emmits event:

```
// ...
twee.emit('twee-passport-extension.strategiesInstalled'); // <- HERE

// Initializing Passport
app.use(passport.initialize());
app.use(passport.session());

// ... routes to express.app installed HERE

twee.emit('twee-passport-extension.strategiesRoutesInstalled') // <- AFTER THIS INSTALL YOUR ROUTES
```

So you can subscribe to this event and wait until `twee-passport-extension` will install it's strategies. And add your specific strategies to application.

Just like:
```
twee.once('twee-passport-extension.strategiesInstalled', function(){
    // Add your custom strategies here
})
```


Installation
==

To install extension use this command:

```
npm install twee-passport-extension --save
```

Also if you need to support some passport strategies just add them in `package.json` too by editing `package.json` of your application:

```
"dependencies": {
    "twee-passport-extension": "*",
    "express-session": "*", // This is for storing returned data into session
    "passport": "*",
    "passport-twitter": "*",
    "passport-facebook": "*",
    "passport-google": "*",
    "passport-linkedin": "*",
    "passport-http": "*",
}
```


Turning extension `ON` in `application/configs/twee.js`:

```
module.exports = {
    "extensions": {
        "Passport": {
            "module": "twee-passport-extension"
        }
    }
};
```

Here is typical config regarding using this extension `application/configs/twee.js`:

```
module.exports = {
    "extensions": {
        "i18n": {
            "module": "twee-i18n-extension",
            "dependencies": {
                "Cookies": {
                    "module": "twee-cookies-extension"
                }
            }
        },
        "Passport": {
            "module": "twee-passport-extension"
        },
        "HTML Compressor": {
            dependencies: {
                "Session": {
                    "disabled": true
                }
            }
        }
    },
    "options": {
        "errorPages": {
            "404": {
                "viewTemplate": __dirname + "/../views/common/pages/404.html"
            }
        }
    },
    "extension": {

        // Here is our config setup
        "twee-passport": {

            // we can disable all the twee-passport here
            "disabled": false,

            // Redirects for twitter, google, facebook, linkedin etc
            "redirects": {
                "successRedirect": "/login",
                "failureRedirect": "/login"
            },

            // Strategies list
            "strategies": {

                // Keys of strategies names should be lowercased and are used to initialize `passport.athenticate` method
                "google": {
                    // Module in which our strategy exists
                    "module": "passport-google",

                    // We can disable this specific strategy
                    "disabled": false,

                    // If we need credentials they should be here
                    "credentials": {
                        "returnURL": "http://127.0.0.1:3000/auth/google/return",
                        "realm": "http://127.0.0.1:3000/",
                        "iis": "YOUR-UNIQUE-DEV-ID@developer.gserviceaccount.com"
                    },
                    // These urls are used for express app.all(urls.redirect, ...)
                    "urls": {
                        "redirect": "/auth/google",
                        "callback": "/auth/google/return"
                    },

                    // These options are used to pass them to `passport.authenticate` as second param
                    "options": {
                        "scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
                    }
                },
                "twitter": {
                    "module": "passport-twitter",
                    "disabled": false,
                    "credentials": {
                        "consumerKey": "YOUR-CONSUMER-KEY",
                        "consumerSecret": "YOUR-CONSUMER-SECRET",
                        "callbackURL": "http://127.0.0.1:3000/auth/twitter/callback/"
                    },
                    "urls": {
                        "redirect": "/auth/twitter",
                        "callback": "/auth/twitter/callback/*"
                    }
                },
                "facebook": {
                    "module": "passport-facebook",
                    "disabled": false,
                    "credentials": {
                        "clientID": "YOUR-CLIENT-ID",
                        "clientSecret": "YOUR-CLIENT-SECRET",
                        "callbackURL": "http://127.0.0.1:3000/auth/facebook/callback"
                    },
                    "urls": {
                        "redirect": "/auth/facebook",
                        "callback": "/auth/facebook/callback"
                    },
                    "options": {
                        "scope": "email"
                    }
                },
                "linkedin": {
                    "module": "passport-linkedin",
                    "disabled": false,
                    "credentials": {
                        "consumerKey": "YOUR-CONSUMER-KEY",
                        "consumerSecret": "YOUR-CONSUMER-SECRET",
                        "callbackURL": "http://127.0.0.1:3000/auth/linkedin/callback",
                        "profileFields": ["id", "first-name", "last-name", "email-address", "headline"]
                    },
                    "urls": {
                        "redirect": "/auth/linkedin",
                        "callback": "/auth/linkedin/callback"
                    },
                    "options": {
                        "scope": ["r_fullprofile", "r_emailaddress"]
                    }
                },

                // Here is digest supported strategy
                "digest": {
                    "module": "passport-http",
                    "disabled": false,
                    "options": {
                    },

                    // The list of url patterns for Express.js to use this auth on
                    "authUrlPattern": ["/"]
                },

                // Basic strategy just like digest. It has little bit different callback (see below)
                "basic": {
                    "module": "passport-http",
                    "disabled": false,
                    "options": {
                    },
                    "authUrlPattern": ["/bootstrap"]
                }
            }
        }
    }
};

```

Ok we have our correct configuration. What is next?
You should know that you can subscribe to events to get fetched data in your controllers.

Lets see what kind of events we can have.

HTML Markup
==

```
<a class="btn btn-primary" href="/auth/twitter">Twitter</a> |
<a class="btn btn-primary" href="/auth/facebook">Facebook</a> |
<a class="btn btn-primary" href="/auth/google">Google+</a> |
<a class="btn btn-primary" href="/auth/linkedin">LinkedIn</a>
```

That's all.

Controller
==

Lets assume we have `AuthController`:

```
var session = require('express-session');

module.exports = function() {

    /**
     * Setting up passport for authenticating
     */
    this.init =  function () {
        var self = this;

        // Usual twitter, facebook and others callbacks with usual Strategy
        twee.on('passport.Strategy.Callback', function(){
            var data = twee.get('passport.Strategy.Data');
            // all the data with tokens etc
            // with done method are in arguments
            session.user = data.arguments[2];
            data.done();
        });

        // Here we can serialize user
        twee.on('passport.serializeUser', function(){
            //console.log('Serialize callback!');
            //console.log(twee.get('passport.serializeUser'));
        });

        // We can access nonce here and check it
        // this implementation is required for digest auth
        twee.on('passport.Strategy.Digest.Params', function(){
            var params = twee.get('passport.Strategy.Digest.Params');
            console.log('Digest Params: ', params);
            params.done(null, true);
        });

        // Digest callback will authenticate or not the user
        twee.on('passport.Strategy.Digest.Callback', function(){
            var data = twee.get('passport.Strategy.Data');
            session.user = {username: 'admin', password: 'pw'};
            return data.done(null, session.user, session.user.password);
        });

        // Basic callback will authenticate or not the user
        twee.on('passport.Strategy.Basic.Callback', function(){
            var data = twee.get('passport.Strategy.Data');
            session.user = {username: 'admin', password: 'pw1'};
            if (data.password != session.user.password
                || data.username != session.user.username) {
                return data.done(null, false);
            }
            return data.done(null, session.user);
        });
    };

    /**
     * Signup action that renders signup form
     * @param req
     * @param res
     */
    this.loginAction =  function (req, res) {
        var self = this;
        res.render('Default/views/pages/Default/login', {
            user: session.user
        });
    }
};

```

We also can subscribe to `passport.deserializeUser` event to deserialize data.

And finally if we have `twitter` key in configuration, then we can subscribe for specific twitter event: `passport.Strategy.twitter`, for `facebook` it will be `passport.Strategy.facebook` etc.


Working Example
==

You can check this example:
[https://github.com/tweeio/twee-examples/tree/master/passport](https://github.com/tweeio/twee-examples/tree/master/passport)

Here is how it looks like:
![](https://raw.githubusercontent.com/tweeio/screenshots/master/twee-passport-extension-example.png)
