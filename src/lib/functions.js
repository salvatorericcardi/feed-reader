import { getAllFromLocalStorage, objToArr, orderBy } from "./utilities.js";

/*** Feed section *****************************/
export async function getFeed(data) {
    const options = {
        method: 'post',
        body: JSON.stringify(data),
    }

    const feed = await fetch(`${window.location.origin}/src/parser.php`, options)
    .then(response => response.json())
    .then(result => result);

    return feed.map(record => {
        const array = [];
        array['title'] = record.title;
        array['link'] = record.link;
        array['pubdate'] = record.pubdate;

        return array;
    })
}

export function clearFeed() {
    const container = document.getElementById('container');
    container.innerHTML = '';
}

export function printFeed(feed, index = 0, page = 0) {
    index = page > 0 ? page : index;

    for (const key in feed[index]) {
        const image = document.createElement('img');
        image.classList.add('images', 'col-3');

        if(feed[index][key].link.search(/governo/i) > -1) {
            image.src = '/src/images/governo.jpeg';
        } else if(feed[index][key].link.search(/inps/i) > -1) {
            image.src = '/src/images/inps.jpeg';
            image.style = 'transform: scale(0.5)';
        } else if(feed[index][key].link.search(/agenziaentrate/i) > -1) {
            image.src = '/src/images/agenzia-delle-entrate.jpeg';
        } else {
            image.src = '/src/images/image.jpg';
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
    }

    if(feed.length > 0) {
        printSummary(feed);
        printPagination(feed, undefined, page);
    } else {
        printSummary();
    }
}

export function splitFeed(feed, pagination) {
    // split feed into chunks
    let chunkSize;
    const chunks = [];

    switch (pagination) {
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

export function filterFeed(feed, filterType, searchRegex) {
    return feed.filter(record => {
        let variable;

        if(filterType == 'all') {
            // return false if find an occurence and stop every loop
            Object.values(record).every(el => variable = el.search(searchRegex) > -1 ? false : true);  
        } else {
            // return false if find an occurence
            variable = record[filterType].search(searchRegex) > -1 ? false : true;
        }

        // invert false to true
        return !variable;
    })
}

/*** Summary section *****************************/
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

/*** Pagination section *****************************/
export function printPagination(feed, form, page) {
    clearPagination();

    const length = Object.keys(feed).length;

    for(let i = 1; i <= length; i++) {
        form = document.forms.namedItem('feed-reader');

        const button = document.createElement('button');
        button.classList.add('pages', 'btn', 'btn-outline-secondary', 'col-auto', 'mx-1');
        button.type = 'button';
        button.textContent = i;
        button.value = i;
        
        button.onclick = async e => {
            const data = {
                stored: getAllFromLocalStorage(localStorage),
                current: null,
            };
            
            const options = {
                method: 'post',
                body: JSON.stringify(data),
            };
        
            const feed = await getFeed(options);
            const chunks = splitFeed(feed, form.pagination.value);

            page = i - 1;

            let storedFeed = sessionStorage.getItem('storedFeed');
            if(storedFeed) {
                const order = form.orderBy.value;

                storedFeed = JSON.parse(storedFeed);
                storedFeed = orderBy(storedFeed, form);

                const chunks = splitFeed(storedFeed, form.pagination.value);

                clearFeed();
                printFeed(chunks, undefined, page);
                return;
            }

            clearFeed();
            printFeed(chunks, undefined, page);
        }

        const pages = document.getElementById('pages');
        pages.appendChild(button);
    }

    const buttons = document.getElementsByClassName('pages');
    buttons.item(page).classList.add('active');

    const tmp = Object.assign(HTMLCollection, buttons);
    let j = 0;

    for (let index = 0; index < length; index++) {
        if(index !== 0 && (index < page - 1 || index > page + 1) && index !== length - 1) {
            tmp[j].remove();
        }

        j++;
    }

    const diff = length - buttons.length;

    const dots = document.createElement('i');
    dots.classList.add('pages', 'bi', 'bi-three-dots', 'col-auto', 'mx-1');

    const dotsCopy = dots.cloneNode();

    if(page <= 2 || page >= length - 3) {
        if(length > 1) {
            if(page + 1 < length / 2) {
                buttons[buttons.length - 1].before(dots);
            } else if(page + 1 > length / 2) {
                buttons[0].after(dots);
            }
        }
    } else {
        if(page > 2 || page < length - 3) {
            buttons[0].after(dots);
            buttons[buttons.length - 1].before(dotsCopy);
        }
    }
}

export function clearPagination() {
    const pages = document.getElementById('pages');
    pages.innerHTML = '';
}

export async function perPage(feed, pagination) {
    return splitFeed(feed, pagination);
}