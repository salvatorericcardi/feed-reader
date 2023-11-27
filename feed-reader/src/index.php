<?php

define("ROOT_PATH", __DIR__ . "..");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

if ((isset($uri[2]) && $uri[2] != 'feed') || !isset($uri[3])) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

require ROOT_PATH . "/src/api/feed.php";

$feed = new Feed();
$feed->getFeed();