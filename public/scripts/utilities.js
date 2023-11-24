export function getAllFromLocalStorage() {
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
};

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