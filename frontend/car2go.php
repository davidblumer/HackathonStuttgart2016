<?php

function getCar2goData ($carId)
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://cvl.daimler-tss.com/hackathon/vss/vehicles/'.$carId);

    $result = curl_exec($ch);

    curl_close($ch);

    return $result;
}