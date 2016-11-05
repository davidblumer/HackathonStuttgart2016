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
var game     = {
    keys:    {
        down:  null,
        left:  null,
        right: null,
        up:    null
    },
    layer:   null,
    lastMovementSent: null,
    phaser:  null,
    player:  [],
    map:     null,
    socket:  null
};

var logPrefix = 'HACKSTGT16: ';

var socketCommands = {
    userConnect:        'user.session.connect',
    userConnected:      'user.session.connected',
    userJoined:         'user.session.joined',
    userLeft:           'user.session.left',
    userList:           'user.list',
    userLocationChange: 'user.location.change',
    userMovement:       'user.movement'
};

/**
 *
 */
function gameCreate()
{
    game.phaser.physics.startSystem(Phaser.Physics.ARCADE);

    game.phaser.stage.backgroundColor = '#CCCCCC';

    game.map = game.phaser.add.tilemap('map');

    game.map.addTilesetImage('Map', 'mapTiles');

    game.layer = game.map.createLayer('Tile Layer 1');

    game.layer.resizeWorld();








    gameInitKeys();
    gameInitPlayers();
}

function gameInitKeys ()
{
    game.keys.up    = game.phaser.input.keyboard.addKey(Phaser.Keyboard.UP);
    game.keys.down  = game.phaser.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    game.keys.left  = game.phaser.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    game.keys.right = game.phaser.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
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

        var newPlayer = {
            socketId: null,
            sprite:   playerSprite
        };

        game.player.push(newPlayer);
    }
}

/**
*
*/
function gamePreload()
{
    game.phaser.load.tilemap('map', 'data/map.json', null, Phaser.Tilemap.TILED_JSON);

    game.phaser.load.image('mapTiles', 'assets/images/tilemaps/map.png');


    game.phaser.load.spritesheet('players', 'assets/images/tilemaps/player.png', 16, 16, 81);



}

/**
 *
 */
function gameRender()
{
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

function getUserForSocketUser (socketUser)
{
    for (var i = 0; i < 4; ++i)
    {
        var currentPlayer = game.player[i];

        if (currentPlayer.socketId == socketUser.id)
        {
            return currentPlayer;
        }
    }

    return false;
}




localStorage.debug = '*gds';





game.socket = io.connect(getServerAddress('david'), getServerConnectionOptions());


game.socket.on('connect', function ()
{
    console.log(logPrefix + 'socket connected');


    var userData = {
        name: 'TT'
    };

        game.socket.emit(socketCommands.userConnect, userData);


    game.socket.on(socketCommands.userLocationChange, function(user)
    {
        var currentPlayer = getUserForSocketUser(user);

        if (currentPlayer)
        {
            currentPlayer.sprite.x = user.location.x;
            currentPlayer.sprite.y = user.location.y;

            var animationName = null;

            switch (user.direction)
            {
                case directions.down:  animationName = 'moveDown';  break;
                case directions.left:  animationName = 'moveLeft';  break;
                case directions.right: animationName = 'moveRight'; break;
                case directions.up:    animationName = 'moveUp';    break;
            }

            currentPlayer.sprite.animations.stop();

            if (animationName)
            {
                currentPlayer.sprite.animations.play(animationName);
            }
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

            if (currentPlayer.socketId == null)
            {
                currentPlayer.socketId       = user.id;
                currentPlayer.sprite.visible = true;
                currentPlayer.sprite.x       = user.location.x;
                currentPlayer.sprite.y       = user.location.y;

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

                if (localUser.socketId == serverUser.id)
                {
                    serverUserFound = true;
                }
            }

            if (!serverUserFound)
            {
                for (var i = 0; i < 4; ++i)
                {
                    var localUser = game.player[i];

                    if (localUser.socketId == null)
                    {
                        console.log('Tesfast', serverUser, localUser);

                        localUser.socketId       = serverUser.id;
                        localUser.sprite.visible = true;
                        localUser.sprite.x       = serverUser.location.x;
                        localUser.sprite.y       = serverUser.location.y;

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

    // TODO alles resetten

});

game.socket.on('error', function()
{
    console.log(logPrefix + 'socket error');


});




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


