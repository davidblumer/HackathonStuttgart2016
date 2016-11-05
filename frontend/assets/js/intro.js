$(document).ready(function()
{
    var starSound    = $('#starSound')[0];
    var victorySound = $('#victorySound')[0];
    var intro        = $('#intro');

    if (localStorage.skipIntro)
    {
        $('#intro').remove();
    }

    preload([
        'assets/images/game_logo_high.png'
    ]);

    intro.click(function()
    {
        toggleTimer();

        victorySound.play();

        window.setTimeout(function()
        {
            intro.addClass('hover');

            starSound.play();

            window.setTimeout(function()
            {
                intro.removeClass('hover');

                window.setTimeout(function()
                {
                    intro.fadeOut(250);
                }, 250);
            }, 250);
        }, 2000);
    });
});

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
}