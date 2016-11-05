function showTechStack ()
{
    var starSound    = $('#starSound')[0];
    starSound.play();

    var string = ['<table>'];


    string.push('<tr><td>API proxies</td><td>php</td>');
    string.push('<tr><td>Game framework</td><td>phaser.js</td>');
    string.push('<tr><td>Multiplayer</td><td>socket.io</td>');
    string.push('<tr><td>IDE</td><td>PHPStorm</td>');
    string.push('<tr><td>Package managers</td><td>npm, bower</td>');

    string.push('</table>');

    showQuest(string.join(''), 'tech');
}