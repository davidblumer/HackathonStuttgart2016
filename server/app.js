const app  = require('express')();
const _    = require('lodash');
const http = require('http').Server(app);
const io   = require('socket.io')(http);

var server_port       = process.env.PORT || 1338;

// Header etc.
app.use(function (req, res, next) {
    // next layer of middleware
    next();
});



var clients = [];
var map = [];

io.on('user.session.connect', function(socket, name){
    clients.push({id: socket.id, name: name});
});

















// Routes
app.get('/', function(req, res) {
    res.send('Hello orld!');
});

// server listens in on port
http.listen(server_port, function () {
    console.log( "Server running on port: " + server_port );
});



function executeMovement(userId, movement) {
    var user = _.find(clients, ['id', userId]);


    for(var i = 0; i < movement.length; i++) {

    }
}