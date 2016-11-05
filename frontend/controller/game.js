/**
 * Hackathon Stuttgart Frontend Code
 *
 * @see https://github.com/SocialbitGmbH/HackathonStuttgart2016/tree/develop
 */

var directions = {
    down:  'down',
    left:  'left',
    right: 'right',
    up:    'up'
};
var game = null;

var logPrefix = 'HACKSTGT16: ';

var socketCommands = {
    mapLayout:          'map.layout',
    userConnect:        'user.session.connect',
    userConnected:      'user.session.connected',
    userJoined:         'user.session.joined',
    userLeft:           'user.session.left',
    userList:           'user.list',
    userLocationChange: 'user.location.change',
    userMovement:       'user.movement'
};

function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function gameAddPlayer (user, x, y, id)
{
    console.log(logPrefix + 'gameAddPlayer', user, x, y, id);

    if (id)
    {
        user.socketId   = id;
    }

    user.sprite.visible = true;
    user.sprite.x       = x;
    user.sprite.y       = y;
}

function gameAddPlayerFromSocketUser (user, socketUser)
{
    console.log(logPrefix + 'gameAddPlayerFromSocketUser', user, socketUser);

    gameAddPlayer(user, socketUser.location.x, socketUser.location.y, socketUser.id);
}

/**
 *
 */
function gameCreate()
{
    console.log(logPrefix + 'gameCreate');

    reset();

    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);

    game.phaser.stage.backgroundColor = '#CCCCCC';

    game.map = game.phaser.add.tilemap('map');

    game.map.addTilesetImage('Map', 'mapTiles');


















    gameInitLayers();
    gameInitKeys();
    gameInitPlayers();


    game.socket.emit('user.list');


}

function gameInitKeys ()
{
    game.keys.up    = game.phaser.input.keyboard.addKey(Phaser.Keyboard.UP);
    game.keys.down  = game.phaser.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    game.keys.left  = game.phaser.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    game.keys.right = game.phaser.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
}

function gameInitLayers ()
{
    for (var key in game.layer)
    {
        var currentLayer = game.layer[key];

        if (!currentLayer)
        {
            currentLayer = game.map.createLayer(capitalize(key));

            currentLayer.resizeWorld();
        }
    }
}

function gameInitPlayers ()
{
    for (var i = 0; i < 4; ++i)
    {
        var spriteIndex = i * 8;

        var playerSprite = game.phaser.add.tileSprite(0, 0, 16, 16, 'players');
        playerSprite.animations.add('moveDown',  [spriteIndex + 0, spriteIndex + 4]);
        playerSprite.animations.add('moveLeft',  [spriteIndex + 3, spriteIndex + 7]);
        playerSprite.animations.add('moveRight', [spriteIndex + 2, spriteIndex + 6]);
        playerSprite.animations.add('moveUp',    [spriteIndex + 1, spriteIndex + 5]);
        playerSprite.visible = false;
        playerSprite.animations.play('moveDown');
        playerSprite.animations.stop();

        var newPlayer = {
            socketId: null,
            sprite:   playerSprite
        };

        game.player.push(newPlayer);
    }
}

function gameMovePlayerTo (player, x, y, direction)
{
    console.log(logPrefix + 'gameMovePlayerTo', player, x, y);

    player.sprite.x = x;
    player.sprite.y = y;

    var animationName = null;

    switch (direction)
    {
        case directions.down:  animationName = 'moveDown';  break;
        case directions.left:  animationName = 'moveLeft';  break;
        case directions.right: animationName = 'moveRight'; break;
        case directions.up:    animationName = 'moveUp';    break;
    }

    player.sprite.animations.stop();

    if (animationName)
    {
        player.sprite.animations.play(animationName);
    }
}

/**
*
*/
function gamePreload()
{
    console.log(logPrefix + 'gamePreload');

    //game.phaser.load.tilemap('map', 'data/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.phaser.load.tilemap('map', null, game.tileData, Phaser.Tilemap.TILED_JSON);

    game.phaser.load.image('mapTiles', 'assets/images/tilemaps/map.png');


    game.phaser.load.spritesheet('players', 'assets/images/tilemaps/player.png', 16, 16, 81);



}

function gameRemovePlayer (player)
{
    player.socketId       = null;
    player.sprite.visible = false;
}

/**
 *
 */
function gameRender()
{
    // console.log(logPrefix + 'gameRender');
    // TODO
}

/**
 *
 */
function gameUpdate()
{
    // TODO

    var movementData = {
        down:  game.keys.down.isDown,
        left:  game.keys.left.isDown,
        right: game.keys.right.isDown,
        up:    game.keys.up.isDown
    };

    if (movementData.down || movementData.left || movementData.right || movementData.up)
    {
        var currentTime = (new Date()).getTime();

        if (game.lastMovementSent == null || game.lastMovementSent + 25 < currentTime)
        {
            game.lastMovementSent = currentTime;
            game.socket.emit(socketCommands.userMovement, movementData);
        }
    }
}

/**
 * @param target
 * @returns {*}
 */
function getServerAddress (target)
{
    if (target == 'josh')  return '192.168.2.135:1338';
    if (target == 'david') return '192.168.2.120:1338';

    return 'localhost:1338';
}

/**
 * @returns {{force new connection: boolean}}
 */
function getServerConnectionOptions ()
{
    return {
        'force new connection': true
    };
}

/**
 * @param socketUser
 * @returns {*}
 */
function getUserForSocketUser (socketUser)
{
    for (var i = 0; i < 4; ++i)
    {
        var currentPlayer = game.player[i];

        console.log(logPrefix + 'getUserForSocketUser', currentPlayer.socketId, socketUser.id);

        if (currentPlayer.socketId == socketUser.id)
        {
            return currentPlayer;
        }
    }

    return false;
}

function reset ()
{
    if (game == null)
    {
        game = {
            keys:    {
                down:  null,
                left:  null,
                right: null,
                up:    null
            },
            layer:
            {
                // Beware: order is important here!
                sea: null,
                ground: null,
                ground1: null,
                train: null,
                trees: null,
                road: null,
                additions: null,
                house: null,
                extras: null
            },
            lastMovementSent: null,
            phaser:  null,
            player:  [],
            map:     null,
            socket:  null,
            tileData: null
        };
    }
    else if (game.player && game.player.length == 4)
    {
        for (var i = 0; i < 4; ++i)
        {
            gameRemovePlayer(game.player[i]);
        }
    }
}




localStorage.debug = '*fsaf';




reset();

game.socket = io.connect(getServerAddress('david'), getServerConnectionOptions());


game.socket.on('connect', function ()
{
    console.log(logPrefix + 'socket connected');


    var userData = {
        name: 'TT'
    };

    game.socket.emit(socketCommands.userConnect, userData);


    game.socket.on(socketCommands.mapLayout, function(mapLayout)
    {
        var mapLayoutString = JSON.stringify(mapLayout);

        // console.log(logPrefix + 'map layout data', mapLayout, mapLayoutString);

        game.tileData = mapLayoutString;
    });


    game.socket.on(socketCommands.userLocationChange, function(user)
    {
        var currentPlayer = getUserForSocketUser(user);

        console.log(logPrefix + 'userLocationChange', user, currentPlayer);

        if (currentPlayer)
        {
            gameMovePlayerTo(currentPlayer, user.location.x, user.location.y, user.direction);
        }
        else
        {
            console.error(logPrefix + 'userLocationChange: no user found', user, currentPlayer, game.player);
        }
    });


    game.socket.on(socketCommands.userConnected, function(user)
    {
       // TODO??
    });

    game.socket.on(socketCommands.userLeft, function(user)
    {
        var currentPlayer = getUserForSocketUser(user);

        if (currentPlayer)
        {
            currentPlayer.socketId       = null;
            currentPlayer.sprite.visible = false;

            // TODO quit sound
        }
    });

    game.socket.on(socketCommands.userJoined, function(user)
    {
        for (var i = 0; i < 4; ++i)
        {
            var currentPlayer = game.player[i];

            if (currentPlayer && currentPlayer.socketId == null)
            {
                gameAddPlayerFromSocketUser(currentPlayer, user);

                break;
            }
        }
    });

    game.socket.on(socketCommands.userList, function (selfUserId, serverUsers)
    {
        console.log(logPrefix + 'socket user list', selfUserId, serverUsers);

        for (var serverUserKey in serverUsers)
        {
            var serverUser = serverUsers[serverUserKey];
            var serverUserFound = false;

            for (var i = 0; i < 4; ++i)
            {
                var localUser = game.player[i];

                if (localUser && localUser.socketId == serverUser.id)
                {
                    serverUserFound = true;

                    if (selfUserId == serverUser.id)
                    {
                        gameAddPlayer(localUser, serverUser.location.x, serverUser.location.y, selfUserId);
                    }
                }

            }

            if (!serverUserFound)
            {
                for (var i = 0; i < 4; ++i)
                {
                    var localUser = game.player[i];

                    if (localUser  && localUser.socketId == null)
                    {
                        gameAddPlayerFromSocketUser(localUser, serverUser);

                        break;
                    }
                }
            }
        }
    });
});

game.socket.on('disconnect', function ()
{
    console.log(logPrefix + 'socket disconnected');

    reset();
});

game.socket.on('error', function()
{
    console.log(logPrefix + 'socket error');


});




function waitForMapData ()
{
    if (game.tileData)
    {
        game.phaser = new Phaser.Game(
            window.innerWidth,
            window.innerHeight,
            Phaser.CANVAS,
            'hackathonStuttgart',
            {
                preload: gamePreload,
                create:  gameCreate,
                update:  gameUpdate,
                render:  gameRender
            }
        );

    }
    else
    {
        window.setTimeout(waitForMapData, 250);
    }

}




waitForMapData();