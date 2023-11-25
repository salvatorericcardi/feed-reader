import { getAllFromLocalStorage, objToArr } from "./utilities.js";

/*** Feed Section *****************************/
export async function getFeed(options) {
    const feed = await fetch('/public/parser.php', options)
        .then(response => response.json())
        .then(result => result);

    return feed.map(record => {
        const array = [];
        array['title'] = record.title;
        array['link'] = record.link;
        array['pubdate'] = record.pubdate;

        return array;
    })
};

export function clearFeed() {
    const container = document.getElementById('container');
    container.innerHTML = '';
}

export function printFeed(feed, index = 0) {
    for (const key in feed[index]) {
        const image = document.createElement('img');
        image.classList.add('images', 'col-3');

        if(feed[index][key].link.search(/governo/i) > -1) {
            image.src = '/public/images/governo.jpeg';
        } else if(feed[index][key].link.search(/inps/i) > -1) {
            image.src = '/public/images/inps.jpeg';
            image.style = 'transform: scale(0.5)';
        } else if(feed[index][key].link.search(/agenziaentrate/i) > -1) {
            image.src = '/public/images/agenzia-delle-entrate.jpeg';
        } else {
            image.src = '/public/images/image.jpg';
            image.style = 'transform: scale(0.5)';
        }

        // article section
        const title = document.createElement('h3');
        title.innerText = feed[index][key].title;

        const link = document.createElement('a');
        link.innerText = feed[index][key].link;
        link.href = feed[index][key].link;

        const pubdate = document.createElement('div');
        const date = new Date(feed[index][key].pubdate);
        pubdate.innerText = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

        const article = document.createElement('div');
        article.classList.add('col-9');
        article.appendChild(title);
        article.appendChild(link);
        article.appendChild(pubdate);

        // news section
        const news = document.createElement('div');
        news.classList.add('row', 'align-items-center');
        news.appendChild(image);
        news.appendChild(article);

        // container section
        const container = document.getElementById('container');
        container.appendChild(news);   
    };

    if(feed.length > 0) {
        printSummary(feed);
        printPagination(feed);
    } else {
        printSummary();
    }
};

export function splitFeed(feed) {
    const form = document.forms.namedItem('feed-reader');

    // split feed into chunks
    let chunkSize;
    const chunks = [];

    switch (form.pagination.value) {
        case 'five':
            chunkSize = 5;
            break;
        case 'ten':
            chunkSize = 10;
            break;
        case 'twenty':
            chunkSize = 20;
            break;
        case 'fifty':
            chunkSize = 50;
            break;
        default: 
            chunkSize = 10;
            break;
    }

    for (let i = 0; i < Object.keys(feed).length; i += chunkSize) {
        if(!Array.isArray(feed)) feed = objToArr(feed);

        const chunk = feed.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    return chunks;
}

/*** Summary Section *****************************/
export function printSummary(feed = []) {
    let i = 0;

    for (const key in feed) {
        for (const record of feed[key]) {
            i++;            
        }
    }

    if(feed.length > 0) {
        document.getElementById('summary').innerText = 'Hai trovato ' + feed.length + ' pagine per un totale di ' + i + ' articoli';
    } else {
        document.getElementById('summary').innerText = 'Non ci sono articoli da leggere';
    }
}

/*** Pagination Section *****************************/
export function printPagination(feed, form) {
    clearPagination();

    for(let i = 1; i <= Object.keys(feed).length; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-secondary', 'col-auto', 'mx-1');
        button.type = 'button';
        button.textContent = i;
        button.value = i;
        
        button.onclick = async e => {
            const data = {
                stored: getAllFromLocalStorage(),
                current: null,
            };
            
            const options = {
                method: 'post',
                body: JSON.stringify(data),
            };
        
            const feed = await getFeed(options);
            const chunks = splitFeed(feed, form);

            let storedFeed = sessionStorage.getItem('storedFeed');
            if(storedFeed) {
                const form = document.forms.namedItem('feed-reader');
                const order = form.orderBy.value;

                storedFeed = JSON.parse(storedFeed);
                storedFeed = orderBy(storedFeed, form);

                const chunks = splitFeed(storedFeed, form);

                clearFeed();
                printFeed(chunks, i - 1);
                return;
            }

            clearFeed();
            printFeed(chunks, i - 1);
        };

        pages.appendChild(button);
    }
}

export function clearPagination() {
    const pages = document.getElementById('pages');
    pages.innerHTML = '';
}

export function orderBy(feed, form) {
    feed = !Array.isArray(feed) ? objToArr(feed) : feed;

    switch (form.orderBy.value) {
        case 'date_asc':
            feed = feed.sort((a, b) => a.pubdate - b.pubdate).reverse();
            break;
        case 'date_desc':
            feed = feed.sort((a, b) => a.pubdate - b.pubdate);
            break;
        case 'title_asc':
            feed = feed.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            feed = feed.sort((a, b) => a.title.localeCompare(b.title)).reverse();
            break;
    }

    return feed;
}

export async function perPage(feed) {
    return splitFeed(feed);
}