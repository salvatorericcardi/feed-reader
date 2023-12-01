<?php

require __DIR__ . "\\api\\feed.php";

header('Access-Control-Allow-Origin: http://localhost:19006');

$feed = new Feed();
echo json_encode($feed->getFeed());
exit;

?>