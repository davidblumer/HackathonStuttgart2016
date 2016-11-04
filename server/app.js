const express = require('express');
const app = express();

var server_port       = process.env.PORT || 1338;

// Header etc.
app.use(function (req, res, next) {
    console.log('Asdf');

    // next layer of middleware
    next();
});


// Routes
app.get('/a', function(req, res) {
    console.log('penis');
});

// server listens in on port
app.listen(server_port, function () {
    console.log( "Listening on server_port " + server_port );
});