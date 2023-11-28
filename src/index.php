<?php

require __DIR__ . "\\api\\feed.php";

$feed = new Feed();
echo json_encode($feed->getFeed());

?>