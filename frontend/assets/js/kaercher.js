function showKaercherWasserspender1 ()
{
    getKaercherData('/kaercher1.php');
}

function showKaercherWasserspender2 ()
{
    getKaercherData('/kaercher2.php');
}

function showKaercherWasserspender3 ()
{
    getKaercherData('/kaercher3.php');
}

function getKaercherData (url)
{
    var starSound    = $('#starSound')[0];
    starSound.play();
    $('#loading').fadeIn(50);

    $.get(url, function( data ) {
        $('#loading').fadeOut(50);

        var string = ['<table>'];

        var dataPoints = $(data).find('datapoints');

        // console.log('dataPoints', dataPoints);

        dataPoints.each(function() {
            var currentItem = $(this);

            var name = currentItem.find('name').text();
            var value = currentItem.find('value').text();
            var readableName = kaercherGetHumanReadableStringForName(name);

            if (readableName)
            {
                finalText = '<tr><td>' + readableName + '</td><td>' + value + '</td>';

                string.push(finalText);
            }

            console.log('data', name, value);

        });

        string.push('</table>');

        showQuest(string.join(''), 'kaercher');

    });
}


function kaercherGetHumanReadableStringForName (name)
{
    // TODO wenn zeit reicht

    return name;
}