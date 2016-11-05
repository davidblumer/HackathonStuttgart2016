const app = require('express')();
const _ = require('lodash');
var map = require('./map.json');
const http = require('http').Server(app);
const io = require('socket.io')(http);

/*
 var Jimp = require("jimp");

 Jimp.read("../frontend/assets/images/tilemaps/map.png", function (err, sourceMap)
 {
 var tileSize  = 16;
 var spaceSize = 1;
 var tilesX    = (sourceMap.bitmap.width + 1) / (tileSize + spaceSize);
 var tilesY    = (sourceMap.bitmap.height + 1) / (tileSize + spaceSize);

 console.log('Fixing image, tiles:', tilesX, tilesY);

 var newSize = {
 height: tileSize * tilesY,
 width:  tileSize * tilesX
 };

 var targetImage = new Jimp(newSize.width, newSize.height, function (err, newImage)
 {
 for (var x = 0; x < tilesX; ++x)
 {
 for (var y = 0; y < tilesY; ++y)
 {
 newImage.blit(
 sourceMap,
 x * tileSize,
 y * tileSize,
 (x * (tileSize + spaceSize)),
 (y * (tileSize + spaceSize)),
 tileSize,
 tileSize);
 }
 }

 newImage.write('../frontend/assets/images/tilemaps/mapNoSpace.png')
 });
 });*/

var server_port = process.env.PORT || 1338;

// Header etc.
app.use(function (req, res, next) {
    // next layer of middleware
    next();
});

var doorLocked = true;
var debug = false;
var clients = [];
var colors = ['green', 'blue', 'red', 'yellow', 'beige'];

var quests = [
    {
        data:  1,
        event: 'quest.show.car2go',
        locations: [
            {
                x: 28,
                y: 25
            },
            {
                x: 29,
                y: 25
            },
            {
                x: 30,
                y: 25
            }
        ],
        user: null
    },
    {
        data:  2,
        event: 'quest.show.car2go',
        locations: [
            {
                x: 28,
                y: 27
            },
            {
                x: 29,
                y: 27
            },
            {
                x: 30,
                y: 27
            }
        ],
        user: null
    },
    {
        data:  3,
        event: 'quest.show.car2go',
        locations: [
            {
                x: 28,
                y: 29
            },
            {
                x: 29,
                y: 29
            },
            {
                x: 30,
                y: 29
            }
        ],
        user: null
    },
    {
        data:  4,
        event: 'quest.show.car2go',
        locations: [
            {
                x: 28,
                y: 31
            },
            {
                x: 29,
                y: 31
            },
            {
                x: 30,
                y: 31
            }
        ],
        user: null
    },
    {
        data:  1,
        event: 'quest.show.kaercher',
        locations: [
            {
                x: 62,
                y: 53
            }
        ],
        user: null
    },
    {
        data:  2,
        event: 'quest.show.kaercher',
        locations: [
            {
                x: 64,
                y: 53
            }
        ],
        user: null
    },
    {
        data:  3,
        event: 'quest.show.kaercher',
        locations: [
            {
                x: 43,
                y: 14
            },
            {
                x: 44,
                y: 14
            },
            {
                x: 43,
                y: 15
            },
            {
                x: 44,
                y: 15
            }
        ],
        user: null
    },
    {
        data:  1,
        event: 'quest.show.text',
        locations: [
            {
                x: 52,
                y: 28
            }
        ],
        user: null
    },
    {
        data:  1,
        event: 'quest.twoPlayer.unlock',
        locations: [
            {
                x: 71,
                y: 24
            },
            {
                x: 71,
                y: 25
            }
        ],
        user: null
    },
    {
        data:  2,
        event: 'quest.twoPlayer.unlock',
        locations: [
            {
                x: 73,
                y: 24
            },
            {
                x: 73,
                y: 25
            }
        ],
        user: null
    }
];



/**
 * Map
 */

// var allowedTerrain = {
//     dirt: [512, 513, 514, 568, 569, 570, 624, 625, 626],
//     water: [3, 4, 5, 59, 60, 61, 115, 116, 117],
//     gravel: [1184, 1185, 1186, 1240, 1241, 1242, 1296, 1297, 1298],
//     grass: [843, 844, 845, 899, 900, 901, 955, 956, 957],
//     stone: [848, 849, 850, 904, 905, 906, 960, 961, 962],
//     rails: [1050, 1051, 1052, 1106, 1107, 1108]
// };

// NO WALLS: 908, 797, 901, 128, 682, 128
var forbiddenTerrain = [888, 940, 939, 179, 593, 595, 585, 541, 646, 356, 242, 642, 598, 589, 946, 365];
var cache = {forbiddenTiles: []};

function isMovementAllowed(location, direction) {

    if (location.x < 0 || location.y < 0)
    {
        return false;
    }






    var tile = {
        x: Math.floor(location.x / 16),
        y: Math.floor(location.y / 16)
    };





    if (direction == 'right')
    {
        ++tile.x;
    }

    if (direction == 'down')
    {
        ++tile.y;
    }


    if (tile.x == 72 && tile.y == 23 && doorLocked)
    {
        return false;
    }


    var locationString = tile.x + '_' + tile.y;



    var isForbidden = cache.forbiddenTiles.indexOf(locationString) > -1;

    console.log(location, tile, direction, locationString, isForbidden);

    if (isForbidden) {
        return false;
    }



    /*var x = Math.floor(location.x / 16) * 16;
     var y = Math.floor(location.y / 16) * 16;



     if (cache.raw.indexOf(locationString) > -1) {
     console.log('hitler', x, y);
     return false;
     }*/
    return true;
}

function generateLocation() {
    // return {
    //     x: Math.round(Math.random() * (map.tilesets[0].imagewidth - 0) + 0),
    //     y: Math.round(Math.random() * (map.tilesets[0].imageheight - 0) + 0)
    // };
    return {
        x: Math.floor(Math.random() * 42) + 34,
        y: Math.floor(Math.random() * 27) + 26
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

        setTimeout(function ()
        {
            socket.emit('collision.list', cache.forbiddenTiles);
        }, 1000);

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

        var moveSpeed = 2 + (data.shift ? 4 : 0);

        var user = _.find(clients, ['id', socket.id]);
        var newLocation = { x: user.location.x, y: user.location.y };

        var now = Date.now();

        if (user && (now > user.lastMovement + 25 || !user.lastMovement)) {
            if (data.left) {
                //  console.log('Movement detected: ', socket.id, ' ►');
                newLocation.x -= moveSpeed;
                user.direction = 'left';
            }
            if (data.right) {
                //   console.log('Movement detected: ', socket.id, ' ◄');
                newLocation.x += moveSpeed;
                user.direction = 'right';
            }
            if (data.up) {
                //  console.log('Movement detected: ', socket.id, ' ▲');
                newLocation.y -= moveSpeed;
                user.direction = 'up';
            }
            if (data.down) {
                //   console.log('Movement detected: ', socket.id, ' ▼');
                newLocation.y += moveSpeed;
                user.direction = 'down';
            }

            if (isMovementAllowed(newLocation, user.direction)) {
                user.location = newLocation;

                var tile = {
                    x: Math.floor(user.location.x / 16),
                    y: Math.floor(user.location.y / 16)
                };

                var userIsInZone = false;

                var numberOfDoorTriggerDown = 0;

                for (var questKey in quests)
                {
                    var currentQuest = quests[questKey];

                    for (var locationKey in currentQuest.locations)
                    {
                        var currentQuestLocation = currentQuest.locations[locationKey];

                        if (currentQuestLocation.x == tile.x && currentQuestLocation.y == tile.y)
                        {
                            console.log('GDSGSS', currentQuest);

                            if (currentQuest.user == null)
                            {
                                userIsInZone = true;

                                currentQuest.user = user;

                                socket.emit(currentQuest.event, { data: currentQuest.data })
                            }
                        }
                    }



                    if (currentQuest.event == 'quest.twoPlayer.unlock')
                    {
                        if (currentQuest.user != null)
                        {
                            ++numberOfDoorTriggerDown;
                        }
                    }
                }

                console.log('number of door triggers', numberOfDoorTriggerDown);

                if (doorLocked && numberOfDoorTriggerDown >= 2)
                {
                    doorLocked = false;

                    io.emit('quest.door.remove');
                }


                if (!userIsInZone)
                {
                    for (var questKey in quests)
                    {
                        var currentQuest = quests[questKey];

                        if (currentQuest.user == user)
                        {
                            currentQuest.user = null;
                        }
                    }
                }

                // TODO: user wieder von objekten entfernen


                /*
                 data:  1,
                 event: 'quest.show.car2go',
                 locations: [
                 {
                 x: 28,
                 y: 25
                 },
                 {
                 x: 29,
                 y: 25
                 },
                 {
                 x: 30,
                 y: 25
                 }
                 ],
                 user: null
                 */


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

function buildCache() {
    console.log('Building cache');

    var mapWidthInTiles = map.width;

    _.forEach(map.layers, function (layer) {
        for (var i = 0; i < layer.data.length; i++) {
            var terrainId = layer.data[i];

            var y = Math.floor(i / mapWidthInTiles);
            var x = i - (mapWidthInTiles * y);
            var locationString = x + '_' + y;
            var isForbidden = terrainId > 0 && forbiddenTerrain.indexOf(terrainId) > -1;

            console.log('Tile cache:', terrainId, locationString, isForbidden);


            if (isForbidden) {


                if (cache.forbiddenTiles.indexOf(locationString) == -1)
                {


                    cache.forbiddenTiles.push(locationString);
                }
            }

            //if (y > 0) return;
        }
    });



    console.log('Building cache done, forbidden tiles', cache.forbiddenTiles.length, cache.forbiddenTiles[0], cache.forbiddenTiles[1]);
}

buildCache();

console.log('Test', isMovementAllowed({ x: 55, y: 172 } ));