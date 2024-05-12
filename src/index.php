<?php

require __DIR__ . "\\api\\feed.php";

$env = parse_ini_file('.env');
header("Access-Control-Allow-Origin:{$env['BASE_URL']}");

$feed = new Feed();
echo json_encode($feed->getFeed());
exit;