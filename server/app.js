const app = require('express')();
const _ = require('lodash');
const http = require('http').Server(app);
const io = require('socket.io')(http);

var server_port = process.env.PORT || 1338;

// Header etc.
app.use(function (req, res, next) {
    // next layer of middleware
    next();
});


var clients = [];
var colors =  ['green', 'blue', 'red', 'yellow', 'beige'];
var map = [];

/**
 * User-creation
 */
io.on('user.session.connect', function (socket, data) {
    var newLocation = {
        x: 0,
        y: 0
    };


    var user = {
        id: socket.id,
        name: data.name,
        location: newLocation,
        color: colors[clients.length]
    };

    clients.push(user);

    io.emit('user.session.joined', user);
});

/**
 * User-movement
 */
io.on('user.movement', function (socket, data) {
    var user = _.find(clients, ['id', userId]);

    if (data.left) {
        --user.location.x
    }
    if (data.right) {
        ++user.location.x
    }
    if (data.up) {
        ++user.location.y
    }
    if (data.down) {
        --user.location.y
    }

    io.emit('users.location.change', user);
});

/**
 * Routes
 */
app.get('/', function (req, res) {
    res.send('Hello orld!');
});

/**
 * Running
 */
http.listen(server_port, function () {
    console.log("Server running on port: " + server_port);
});