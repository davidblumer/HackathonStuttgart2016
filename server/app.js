const app = require('express')();
const _ = require('lodash');
var map = require('./map.json');
const http = require('http').Server(app);
const io = require('socket.io')(http);

var server_port = process.env.PORT || 1338;

// Header etc.
app.use(function (req, res, next) {
    // next layer of middleware
    next();
});

var debug = false;
var clients = [];
var colors = ['green', 'blue', 'red', 'yellow', 'beige'];

/**
 * Map
 */

var allowedTerrain = {
    dirt: [512, 513, 514, 568, 569, 570, 624, 625, 626],
    water: [3, 4, 5, 59, 60, 61, 115, 116, 117],
    gravel: [1184, 1185, 1186, 1240, 1241, 1242, 1296, 1297, 1298],
    grass: [843, 844, 845, 899, 900, 901, 955, 956, 957],
    stone: [848, 849, 850, 904, 905, 906, 960, 961, 962],
    rails: [1050, 1051, 1052, 1106, 1107, 1108]
};
var cache = {collision: [], walkable: []};

function isMovementAllowed(location) {

    if (_.includes(cache.collision, location)) {
        return false;
    }
    else if (_.includes(cache.walkable, location)) {
        return true
    }
    for (var i = 0; i < map.layers.length; i++) {
        if (_.includes(allowedTerrain, map.layers[i].data[newDestination])) {
            cache.walkable.push(newDestination);
            return true;
        } else {
            cache.collision.push(newDestination);
            return false;
        }
    }
}

function generateLocation() {
    // return {
    //     x: Math.round(Math.random() * (map.tilesets[0].imagewidth - 0) + 0),
    //     y: Math.round(Math.random() * (map.tilesets[0].imageheight - 0) + 0)
    // };
    return {
        x: 0,
        y: 0
    };
}

io.on('connection', function (socket) {

    socket.emit('map.layout', map);

    /**
     * User-creation
     */
    socket.on('user.session.connect', function (data) {

        var newLocation = generateLocation();

        var user = {
            id: socket.id,
            name: data.name,
            location: newLocation,
            color: colors[clients.length],
            thomas: 'richtiger schwanz'
        };

        console.log('New connection: ', data.name);

        clients.push(user);

        socket.emit('user.list', socket.id, clients);

        io.emit('user.session.joined', user);
    });

    /**
     * User-creation
     */
    socket.on('user.list', function (data) {

        socket.emit('user.list', socket.id, clients);
    });

    /**
     * Chat
     */
    socket.on('chat.message', function (data) {
        var user = _.find(clients, ['id', socket.id]);
        console.log('Message sent: ', user.name, ':', data.text);
        io.emit('chat.message', user, data);
    });

    /**
     * User-movement
     */
    socket.on('user.movement', function (data) {
        var user = _.find(clients, ['id', socket.id]);
        var newLocation = user.location;

        var now = Date.now();

        if (user && now > user.lastMovement + 25 || user && !user.lastMovement) {
            if (data.left) {
                //  console.log('Movement detected: ', socket.id, ' ►');
                --newLocation.x;
                user.direction = 'left';
            }
            if (data.right) {
                //   console.log('Movement detected: ', socket.id, ' ◄');
                --newLocation.x;
                user.direction = 'right';
            }
            if (data.up) {
                //  console.log('Movement detected: ', socket.id, ' ▲');
                --newLocation.x;
                user.direction = 'up';
            }
            if (data.down) {
                //   console.log('Movement detected: ', socket.id, ' ▼');
                --newLocation.x;
                user.direction = 'down';
            }

            if(isMovementAllowed(newLocation)) {
                user.location = newLocation;
            }
            user.lastMovement = now;
            io.emit('user.location.change', socket.id, user);
        }
    });
    socket.on('disconnect', function () {
        var user = _.find(clients, ['id', socket.id]);
        console.log('User disconnected ', user.name);
        io.emit('user.session.left', user);

        var index = clients.indexOf(user);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
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
