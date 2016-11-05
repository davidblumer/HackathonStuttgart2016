/**
 * Hackathon Stuttgart Frontend Code
 *
 * @see https://github.com/SocialbitGmbH/HackathonStuttgart2016/tree/develop
 */

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
    player:  null,
    map:     null,
    socket:  null
};

var logPrefix = 'HACKSTGT16: ';

var socketCommands = {
    userConnect:        'user.session.connect',
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


    game.player = game.phaser.add.tileSprite(0, 0, 16, 16, 'players');

    game.player.animations.add('test', [0, 4]);

    game.player.animations.play('test', 8, true);


    game.keys.up = game.phaser.input.keyboard.addKey(Phaser.Keyboard.UP);
    game.keys.down = game.phaser.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    game.keys.left = game.phaser.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    game.keys.right = game.phaser.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
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



    if (game.keys.up.isDown)
    {
        //game.player.y--;
    }
    else if (game.keys.down.isDown)
    {
        //game.player.y++;
    }

    if (game.keys.left.isDown)
    {
        //game.player.x--;
    }
    else if (game.keys.right.isDown)
    {
        //game.player.x++;
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
       // console.log('Testes', user.location.x);


        game.player.x = user.location.x;
        game.player.y = user.location.y;

    });




});

game.socket.on('disconnect', function ()
{
    console.log(logPrefix + 'socket disconnected');


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


