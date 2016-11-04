


var game = new Phaser.Game(
    window.innerWidth,
    window.innerHeight,
    Phaser.CANVAS,
    'hackathonStuttgart',
    {
        preload: preload,
        create:  create,
        update:  update,
        render:  render
    }
);


function preload()
{
    // TODO

}




function create()
{

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#CCCCCC';





}

function update()
{
    // TODO



}

function render()
{
    // TODO



}