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
    $.get(url, function( data ) {

        var string = [];

        var dataPoints = $(data).find('datapoints');

        // console.log('dataPoints', dataPoints);

        dataPoints.each(function() {
            var currentItem = $(this);

            var name = currentItem.find('name').text();
            var value = currentItem.find('value').text();
            var readableName = kaercherGetHumanReadableStringForName(name);

            if (readableName)
            {
                finalText = readableName + ': ' + value;

                string.push(finalText);
            }

            console.log('data', name, value);

        });

        showQuest(string.join('<br />'), 'kaercher');

    });
}


function kaercherGetHumanReadableStringForName (name)
{
    // TODO wenn zeit reicht

    return name;
}