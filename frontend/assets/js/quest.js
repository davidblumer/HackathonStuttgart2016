function showQuest (content, badge)
{
    var quest = $('#quest');

    quest.find('.questContent').html(content);

    if (badge)
    {
        var questBadge = $('#questBadge');
        questBadge.attr('class', '');
        questBadge.addClass(badge);
    }

    $('#quest').animate({ height: 300 }, 250, function()
    {
        $(this).addClass('visible');
    });
    $('#questBottom').fadeIn(250);
}

$(document).ready(function() {
    $('#quest').click(function()
    {
        $('#quest').animate({ height: 0 }, 250, function()
        {
            $(this).removeClass('visible');
        });
        $('#questBottom').fadeOut(250);
    });
});