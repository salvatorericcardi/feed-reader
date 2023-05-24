<?php
class RSSFeed {
    private array $URLs = [];

    function __construct(array $URLs) {
        foreach ($URLs as $url) {
            $url = filter_var($url);

            if(empty($url)) {
                continue;
            }

            array_push($this->URLs, $url);
        }
    }

    public function __get($property) {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }

    public function __set($property, $value) {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }

        return $this;
    }

    public function parse(int $limit = 5) {
        $arr = [];
        $feeds = [];

        foreach ($this->URLs as $key => $url) {
            $xml = simplexml_load_file($url);
            
            if(!$xml) {
                $this->URLs[$key] = "Insert a right RSS Feed URL.";
                continue;
            }

            array_push($feeds, $xml);
        }

        foreach ($feeds as $feed) {
            $temp = [];

            foreach ($feed->channel->item as $item) {
                if(count($temp) == $limit) {
                    break;
                }

                $item = array_change_key_case((array) $item);

                array_push($temp, $item);
            }   

            array_push($arr, $temp);
        }

        return $arr;
    }
}

$rss = new RSSFeed($_POST["rss"]);
$feeds = $rss->parse();
echo json_encode($feeds);