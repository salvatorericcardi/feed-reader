<?php

class Feed {
    private $feed = [];

    public function __construct() {
        $this->feed = [
            'title' => 'Il Presidente Meloni interviene al Forum Internazionale del Turismo',
            'link' => 'https://www.governo.it/it/articolo/il-presidente-meloni-interviene-al-forum-internazionale-del-turismo/24407',
            'pubdate' => '25/11/2023',
        ];
    }

    public function getFeed() {
        return $this->feed;
    }
}