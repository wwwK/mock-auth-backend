const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');

//Load the auth module
const auth = require('./auth.js');

//Configure Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Authentication route
app.post(config.get('authenticationRoute'), function(req, res, next) {
    try {
        var token = auth.authenticate(req.body.identifier, req.body.password);
        res.json({success: true, message: 'Login successful!', token: token});
    } catch (error) {
        next(error);
    }
});

//Authorization route
app.get(config.get('authorizationRoute'), auth.authorize, function(req, res) {
    res.json({success: true});
});

//Role-specific authorization routes
var routes = config.get('routes');
for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    app.get(route.path, auth.authorize, function(req, res, next) {
        if (req.token[route.role] == true) {
            res.json({success: true});
        } else {
            next(new Error("Authorization failed."));
        }
    });
}

//Error handling
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({success: false, message: err.message});
});

app.listen(config.get('port'), () => console.log('Mock auth server listening on port ' + config.get('port') + '.'));
