<?php

// We need this because of CORS issues

include 'kaercher.php';

$mn = '1.024-920.2';
$sn = '000000010440';

echo getKaercherData($mn, $sn);
