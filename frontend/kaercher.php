<?php


function getKaercherData ($mn, $sn)
{
    $postData = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:quer="http://query.tdms.kaercher.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> <soapenv:Header/><soapenv:Body><quer:queryForLastData><machineIdentifiers xmlns:q1="http://query.tdms.kaercher.com" xsi:type="q1:kaercherMachineIdentifier"><localAddress xsi:nil="true" /><materialNumber>'.$mn.'</materialNumber><serialNumber>'.$sn.'</serialNumber></machineIdentifiers></quer:queryForLastData></soapenv:Body></soapenv:Envelope>';

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL,        'https://hackathon.app.kaercher.com/soap/v18/data');
    curl_setopt($ch, CURLOPT_POST,       true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'SOAPAction: queryForLastData',
    ));

    $result = curl_exec($ch);

    curl_close($ch);

    return $result;
}