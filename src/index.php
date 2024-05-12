<?php

require __DIR__ . "\\api\\feed.php";

header('Access-Control-Allow-Origin: http://localhost:19006');
header('Access-Control-Allow-Origin: https://feed-reader-six.vercel.app');

$feed = new Feed();
echo json_encode($feed->getFeed());
exit;