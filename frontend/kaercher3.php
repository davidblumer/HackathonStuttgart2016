<?php

// We need this because of CORS issues

include 'kaercher.php';

$mn = '1.280-150.2';
$sn = '000116';

echo getKaercherData($mn, $sn);
