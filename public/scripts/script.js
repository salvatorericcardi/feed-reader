import { clearFeed, clearPagination, getFeed, orderBy, printFeed, printPagination, printSummary, splitFeed } from "./functions.js";
import { arrToObj, getAllFromLocalStorage, objToArr } from "./utilities.js";

/** Global variables */
var db;

const form = document.forms.namedItem('feed-reader');

const data = {
    stored: getAllFromLocalStorage(),
    current: null,
};

const options = {
    method: 'post',
    body: JSON.stringify(data),
};

/*** Main section ********************************/
form.addEventListener('submit', async e => {
    e.preventDefault();

    const feedTitle = form.title.value.replaceAll(' ', '-');
    const feedValue = form.url.value;
    const feedArray = [];

    feedArray.push({
        title: 'feed-' + feedTitle,
        url: feedValue,
    })

    // save feed in localStorage object
    localStorage.setItem('feed-' + feedTitle, feedValue);

    data.current = feedArray;
    
    const options = {
        method: 'post',
        body: JSON.stringify(data),
    };

    const feed = await getFeed(options);
    const chunks = splitFeed(feed);

    printFeed(chunks);
});

document.getElementById('orderBy').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed');
    storedFeed = JSON.parse(storedFeed);

    let feed = storedFeed ? storedFeed : await getFeed(options);
    feed = objToArr(feed);
    feed = orderBy(feed, form);

    const chunks = splitFeed(feed);

    clearFeed();
    printFeed(chunks);
});

document.getElementById('pagination').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed');
    storedFeed = JSON.parse(storedFeed);
    
    const feed = storedFeed ? storedFeed : await getFeed(options);
    const chunks = await perPage(feed);

    clearFeed();
    printFeed(chunks);
});

document.getElementById('search').addEventListener('change', async e => {
    const search = form.search.value;
    const type = form['search-type'].value;
    
    let storedFeed = sessionStorage.getItem('storedFeed');
    storedFeed = JSON.parse(storedFeed);

    let feed = storedFeed ? storedFeed : await getFeed(options);
    
    if(form.search.value.length == 0) {
        const chunks = splitFeed(feed);
        printFeed(chunks);   

        return;  
    }
    
    const regex = new RegExp(search, 'gi');
    const filtered = feed.filter(record => {
        let variable;

        if(type == 'all') {
            // return false if find an occurence and stop every loop
            Object.values(record).every(el => variable = el.search(regex) > -1 ? false : true);  
        } else {
            // return false if find an occurence
            variable = record[type].search(regex) > -1 ? false : true;
        }

        // invert false to true
        return !variable;
    });

    const newfeed = arrToObj(filtered);

    sessionStorage.setItem('storedFeed', JSON.stringify(newfeed));

    const chunks = splitFeed(filtered);

    clearFeed();

    if(chunks.length != 0) {    
        printFeed(chunks);
    }
})

document.addEventListener('DOMContentLoaded', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed');
    if(storedFeed) {
        const orderedBy = sessionStorage.getItem('orderedBy');
        const pagination = sessionStorage.getItem('perPage');

        storedFeed = JSON.parse(storedFeed);

        storedFeed = orderedBy ? orderBy(storedFeed, form) : storedFeed;
        storedFeed = pagination ? await perPage(storedFeed) : storedFeed;

        const chunks = splitFeed(storedFeed);

        clearFeed();
        printFeed(chunks);
        
        return;
    }
   
    const feed = await getFeed(options);
    const chunks = splitFeed(feed);

    printFeed(chunks);
});