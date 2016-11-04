/**
 * Hackathon Stuttgart Frontend Code
 *
 * @see https://github.com/SocialbitGmbH/HackathonStuttgart2016/tree/develop
 */

var logPrefix = 'HACKSTGT16: ';

/**
 *
 */
function gameCreate()
{
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#CCCCCC';

}

/**
*
*/
function gamePreload()
{
    // TODO

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


















var socket = io.connect(getServerAddress('david'), getServerConnectionOptions());


socket.on('connect', function ()
{
    console.log(logPrefix + 'socket connected');


});

socket.on('disconnect', function ()
{
    console.log(logPrefix + 'socket disconnected');


});

socket.on('error', function()
{
    console.log(logPrefix + 'socket error');


});





var game = new Phaser.Game(
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


