<?php

# get json data and decode
$json = file_get_contents('php://input');
$post = json_decode($json, true);

# initialize variables
$feed = [];

# execute if there are stored urls
if($post['stored'] != null) {
    foreach ($post['stored'] as $item) {
        # load feed rss
        $xml = simplexml_load_file($item['url']) or die('Error during feed loading!');

        # for each cycle add a record in feed array
        foreach ($xml->channel->item as $record) {
            $nrecord = [];
            foreach ($record as $key => $value) {
                switch ($key) {
                    case 'pubdate':
                        $value = DateTime::createFromFormat('d/m/Y', $value);
                        $nrecord[strtolower($key)] = $value->setTimezone(new DateTimeZone('Europe/London'))->format('Y-m-d');
                        break;
                    case 'pubDate':
                        $nrecord[strtolower($key)] = date('Y-m-d', strtotime($value));
                        break;
                    case 'category':
                    case 'enclosure':
                    case 'description':
                    case 'guid':
                        break;
                    default:
                        $value = $key == 'title' ? htmlspecialchars_decode($value) : $value;
                        
                        $nrecord[strtolower($key)] = $value instanceof SimpleXMLElement ? $value->__toString() : $value;
                        break;
                }
            }

            array_push($feed, $nrecord);
        }
    }
}

# check there is an url to execute
if($post['current'] != null) {
    # check if current url is already stored
    foreach ($post['stored'] as $array) {
        $inArray = !in_array($post['current'][0]['url'], $array) ? false : true;
    }

    if(!$inArray) {
        # load feed rss
        $xml = simplexml_load_file($post['current'][0]['url']) or die('Error during feed loading!');
            
        # for each cycle add a record in feed array
        foreach ($xml->channel->item as $record) {
            $nrecord = [];
            foreach ($record as $key => $value) {
                switch ($key) {
                    case 'pubdate':
                        $value = DateTime::createFromFormat('d/m/Y', $value);
                        $nrecord[strtolower($key)] = $value->setTimezone(new DateTimeZone('Europe/London'))->format('Y-m-d');
                        break;
                    case 'pubDate':
                        $nrecord[strtolower($key)] = date('Y-m-d', strtotime($value));
                        break;
                    case 'category':
                    case 'enclosure':
                    case 'description':
                    case 'guid':
                        break;
                    default:
                        $value = $key == 'title' ? htmlspecialchars_decode($value) : $value;

                        $nrecord[strtolower($key)] = $value instanceof SimpleXMLElement ? $value->__toString() : $value;
                        break;
                }
            }

            array_push($feed, $nrecord);
        }
    }
}

# sort feed by pubdate
usort($feed, fn($a, $b) => strtotime($b['pubdate']) - strtotime($a['pubdate']));

if(isset($feed[0])) {
    session_start();
    $_SESSION['feed'] = $feed[0];
    session_unset();
}

# encode feed array and return a json
$json = json_encode($feed);
echo $json;