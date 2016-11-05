function showCar2GoCar1()
{
    getCar2goData('/car2go1.php');
}

function showCar2GoCar2()
{
    getCar2goData('/car2go2.php');
}

function showCar2GoCar3()
{
    getCar2goData('/car2go3.php');
}

function showCar2GoCar4()
{
    getCar2goData('/car2go4.php');
}

function getCar2goData(url) {
    $.get(url, function( data ) {

        var string = '<table>';

        var object = JSON.parse(data.slice(0, -1));

        var beautifiedObject = {
            state: object.powerState,
            engineOn: object.engineOn,
            battery: object.batteryLevel,
            online: object.connection.connected,
            locked: object.locked,
            mileage: object.mileage,
            frontLeftDoorOpen: object.doors.leftOpen,
            frontRightDoorOpen: object.doors.rightOpen,
            backLeftDoorOpen: object.doors.rearLeftOpen,
            backRightDoorOpen: object.doors.rearRightOpen,
            latitude: object.geo.latitude,
            longitude: object.geo.longitude
        };

        $.each(beautifiedObject, function(index, value) {
            string += '<tr>';
            string += '<td>'+index.toUpperCase()+'</td>';
            string += '<td>'+value+'</td>';
            string += '</tr>';
        });

        string += '</table>';

        showQuest(string, 'car2go');

    });
}