export function getAllFromLocalStorage(localStorage) {
    const objects = [];
    
    const keys = Object.keys(localStorage);
    let i = keys.length;

    // iterate until i is true
    while (i--) {
        const object = {};
        object.title = keys[i];
        object.url = localStorage.getItem(keys[i]);
        objects.push(object);
    }

    return objects;
}

export function orderBy(feed, orderBy) {
    feed = !Array.isArray(feed) ? objToArr(feed) : feed;

    switch (orderBy) {
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

export function arrToObj(arrObj, object = {}) {
    arrObj.forEach((item, index) => {
        if (!item) return;
        
        if (Array.isArray(item)) {
            if(Object.keys(item).length == 3) {
                object = {
                    ...object,
                    [index]: {
                        title: item.title,
                        link: item.link,
                        pubdate: item.pubdate,
                    },
                }
            } else {
                object = {
                    ...object,
                    [index]: arrToObj(item, this),
                }
            };
        } else {
            object = {
                ...object,
                [index]: {
                    title: item.title,
                    link: item.link,
                    pubdate: item.pubdate,
                },
            }
        };
    });

    return object;
}

export function objToArr(object) {
    return Object.keys(object).map((key) => object[key]);
}