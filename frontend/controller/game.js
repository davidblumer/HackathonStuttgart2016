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

var actionFunction = null;



var presentationTimer = {
    lastAction: null,
    timer:      null
};

var collisionDebug = null;

var logPrefix = 'HACKSTGT16: ';

var socketCommands = {
    chatMessage:        'chat.message',
    collisionList:      'collision.list',
    doorRemove:         'quest.door.remove',
    questShowText:      'quest.show.text',
    questShowKaercher:  'quest.show.kaercher',
    questCar2go:        'quest.show.car2go',
    mapLayout:          'map.layout',
    twoPlayerUnlock:    'quest.twoPlayer.unlock',
    userConnect:        'user.session.connect',
    userConnected:      'user.session.connected',
    userJoined:         'user.session.joined',
    userLeft:           'user.session.left',
    userList:           'user.list',
    userLocationChange: 'user.location.change',
    userMovement:       'user.movement'
};

/**
 * @param string
 * @returns {string}
 */
function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * @param user
 * @param x
 * @param y
 * @param id
 */
function gameAddPlayer (user, x, y, id)
{
    // console.log(logPrefix + 'gameAddPlayer', user, x, y, id);

    if (id)
    {
        user.socketId   = id;
    }

    user.sprite.visible = true;
    user.sprite.x       = x;
    user.sprite.y       = y;
}

/**
 * @param user
 * @param socketUser
 */
function gameAddPlayerFromSocketUser (user, socketUser)
{
    // console.log(logPrefix + 'gameAddPlayerFromSocketUser', user, socketUser);

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

    game.phaser.stage.backgroundColor = '#FF0000';

    game.map = game.phaser.add.tilemap('map');

    game.map.addTilesetImage('mapNoSpace', 'mapTiles', 16, 16, 1, 1);




// function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {













    gameInitLayers();
    gameInitKeys();
    gameInitPlayers();


    game.socket.emit('user.list');


}

function gameInitKeys ()
{
    game.keys.c     = game.phaser.input.keyboard.addKey(Phaser.Keyboard.C);
    game.keys.t     = game.phaser.input.keyboard.addKey(Phaser.Keyboard.T);
    game.keys.space = game.phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.keys.shift = game.phaser.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
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
            var layerName = capitalize(key);

            console.log(layerName);

            currentLayer = game.map.createLayer(layerName);

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


    // TODO: in funktion auslagern

    game.keySprite = game.phaser.add.tileSprite(0, 0, 16, 16, 'players', 80);
    game.keySprite.x = 46 * 16;
    game.keySprite.y = 54 * 16;



    game.doorSprite = game.phaser.add.tileSprite(0, 0, 16, 16, 'players', 79);
    game.doorSprite.x = 72 * 16;
    game.doorSprite.y = 23 * 16;
}

function getPlayerNameFromUser ()
{
    var name = '';

    if (localStorage.user)
    {
        name = localStorage.user;
    }


    while (!name || name.length < 2)
    {
        name = prompt('Please enter a name with at least two characters. You can set localStorage.user to use a default name in your session.');
    }

    return name;
}

function gameMovePlayerTo (player, x, y, direction, followCamera)
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

    if (followCamera)
    {
        game.phaser.camera.follow(player.sprite);
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

    game.phaser.load.image('mapTiles', 'assets/images/tilemaps/mapNoSpace.png');


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



    return;

    var rect = new Phaser.Rectangle(0, 0, 16, 16);
    // console.log(rect);
    game.phaser.debug.geom( rect, '#0000ff' ) ;

    game.phaser.debug.text( "This is debug text", 10, 10 );

    if (collisionDebug)
    {
        for (var i = 0; i < collisionDebug.length; ++i)
        {
            var entry = collisionDebug[i];
            var splitted = entry.split('_');

            var rect = new Phaser.Rectangle(parseInt(splitted[0], 10) * 16, parseInt(splitted[1], 10) * 16, 16, 16);
           // console.log(rect);
            game.phaser.debug.geom( rect, '#ff0000' ) ;

        }
    }
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
        shift: game.keys.shift.isDown,
        up:    game.keys.up.isDown
    };

    if (movementData.down || movementData.left || movementData.right || movementData.up)
    {
        var currentTime = getCurrentTime();

        if (game.lastMovementSent == null || game.lastMovementSent + 25 < currentTime)
        {
            game.lastMovementSent = currentTime;
            game.socket.emit(socketCommands.userMovement, movementData);
        }
    }

    if (game.keys.c.isDown)
    {
        sendChatMessage();
    }

    if (game.keys.t.isDown)
    {
        toggleTimer();
    }

    if (game.keys.space.isDown)
    {
        console.log('action function', actionFunction);

        if (actionFunction)
        {
            actionFunction();
            actionFunction = null;
        }
    }
}

function getCurrentTime ()
{
    return (new Date()).getTime();
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
        'force new connection': false,
        reconnection: false
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
            door:      null,
            keys:    {
                c:     null,
                down:  null,
                left:  null,
                right: null,
                up:    null
            },
            layer:
            {
                // Beware: order is important here!
                layer1: null,
                layer2: null,
                layer3: null
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


function sendChatMessage ()
{
    var chatMessage = prompt('What do you want to say?');

    if (chatMessage)
    {
        game.socket.emit(socketCommands.chatMessage, { text: chatMessage });
    }

}

function toggleTimer ()
{
    console.log(logPrefix + 'toggleTimer');

    var currentTime = getCurrentTime();

    if (presentationTimer.lastAction == null || presentationTimer.lastAction + 1337 < currentTime)
    {
        presentationTimer.lastAction = currentTime;

        if (presentationTimer.timeout == null)
        {
            presentationTimer.timeout = 60 * 3;

            $('#timer').show();

        }
        else
        {
            presentationTimer.timeout = null;
        }

        updateTimer();
    }
}

function updateTimer ()
{
    --presentationTimer.timeout;


    var minutes = Math.floor(presentationTimer.timeout / 60);
    var seconds = presentationTimer.timeout - (minutes * 60);

    $('#timer').text('Presentation time left: ' + minutes + ':' + seconds);

    if (presentationTimer.timeout != null && presentationTimer.timeout > 0)
    {
        window.setTimeout(updateTimer, 1000);
    }
    else
    {
        presentationTimer.timeout = null;

        $('#timer').hide();
    }
}


localStorage.debug = '*fsaf';




reset();

game.socket = io.connect(getServerAddress('david__'), getServerConnectionOptions());


game.socket.on('connect', function ()
{
    console.log(logPrefix + 'socket connected');



    game.userData = {
        name: getPlayerNameFromUser()
    };

    game.socket.emit(socketCommands.userConnect, game.userData);


    game.socket.on(socketCommands.mapLayout, function(mapLayout)
    {
        var mapLayoutString = JSON.stringify(mapLayout);

        // console.log(logPrefix + 'map layout data', mapLayout, mapLayoutString);

        game.tileData = mapLayoutString;
    });


    game.socket.on(socketCommands.userLocationChange, function(selfUserId, user)
    {
        var currentPlayer = getUserForSocketUser(user);

        console.log(logPrefix + 'userLocationChange', user, currentPlayer);

        if (currentPlayer)
        {
            gameMovePlayerTo(currentPlayer, user.location.x, user.location.y, user.direction, selfUserId == user.id && game.userData.name == user.name);
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

    game.socket.on(socketCommands.collisionList, function(data)
    {
        console.log('collision list', data);

        collisionDebug = data;
    });

    game.socket.on(socketCommands.questShowText, function(data)
    {
        console.log(socketCommands.questShowText, data);

        if (data.data == 1) actionFunction = showTechStack;
    });

    game.socket.on(socketCommands.questShowKaercher, function(data)
    {
        console.log(socketCommands.questShowKaercher, data);

        if      (data.data == 1) actionFunction = showKaercherWasserspender1;
        else if (data.data == 2) actionFunction = showKaercherWasserspender2;
        else if (data.data == 3) actionFunction = showKaercherWasserspender3;
    });


    game.socket.on(socketCommands.doorRemove, function(data)
    {
        console.log(socketCommands.doorRemove, data);

        var unlockSound    = $('#unlockSound')[0];
        unlockSound.play();

        game.doorSprite.visible = false;
    });


    game.socket.on(socketCommands.twoPlayerUnlock, function(data)
    {
        console.log(socketCommands.twoPlayerUnlock, data);

        var starSound    = $('#starSound')[0];
        starSound.play();
    });




    game.socket.on(socketCommands.questCar2go, function(data)
    {
        console.log(socketCommands.questCar2go, data);

        if      (data.data == 1) actionFunction = showCar2GoCar1;
        else if (data.data == 2) actionFunction = showCar2GoCar2;
        else if (data.data == 3) actionFunction = showCar2GoCar3;
        else if (data.data == 4) actionFunction = showCar2GoCar4;
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

        var options = {
            content: user.name + ' left KärcheRPG',
            timeout: 1337 * 2
        };

        $.snackbar(options);
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

        var options = {
            content: user.name + ' joined KärcheRPG',
            timeout: 1337 * 2
        };

        $.snackbar(options);
    });

    /**
     *
     */
    game.socket.on(socketCommands.chatMessage, function(user, message)
    {
        console.log(logPrefix + 'chat message', user, message);

        var finalMessage = user.name + ': ' + message.text;

        var options = {
            content: finalMessage,
            timeout: 1337 * 2
        };

        $.snackbar(options);
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