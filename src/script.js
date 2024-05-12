import { clearFeed, filterFeed, getFeed, perPage, printFeed, splitFeed } from "./scripts/functions.js"
import { arrToObj, getAllFromLocalStorage, objToArr, orderBy } from "./scripts/utilities.js"

/** Global variables */
var db
var page = 0

const form = document.forms.namedItem('feed-reader')

const data = {
    stored: getAllFromLocalStorage(localStorage),
    current: null,
}

const options = {
    method: 'post',
    body: JSON.stringify(data),
}

/*** Main section ********************************/
form.addEventListener('submit', async e => {
    e.preventDefault()

    const feedTitle = form.title.value.replaceAll(' ', '-')
    const feedValue = form.url.value
    const feedArray = []

    feedArray.push({
        title: 'feed-' + feedTitle,
        url: feedValue,
    })

    // save feed in localStorage object
    localStorage.setItem('feed-' + feedTitle, feedValue)

    data.current = feedArray
    
    const options = {
        method: 'post',
        body: JSON.stringify(data),
    }

    const feed = await getFeed(options)
    const chunks = splitFeed(feed, form.pagination.value)

    printFeed(chunks)
})

document.getElementById('orderBy').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed')
    storedFeed = JSON.parse(storedFeed)

    let feed = storedFeed ? storedFeed : await getFeed(options)
    feed = objToArr(feed)
    feed = orderBy(feed, form.orderBy.value)

    const chunks = splitFeed(feed, form.pagination.value)

    clearFeed()
    printFeed(chunks)
})

document.getElementById('pagination').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed')
    storedFeed = JSON.parse(storedFeed)
    
    const feed = storedFeed ? storedFeed : await getFeed(options)
    const chunks = await perPage(feed, form.pagination.value)

    clearFeed()
    printFeed(chunks)
})

document.getElementById('search').addEventListener('change', async e => {
    const search = form.search.value
    const type = form['search-type'].value
    
    // let storedFeed = sessionStorage.getItem('storedFeed')
    // storedFeed = JSON.parse(storedFeed)

    let feed = await getFeed(options)
    // let feed = search === '' ? await getFeed(options) : (Object.keys(storedFeed).length > 2 ? storedFeed : await getFeed(options))  

    if(form.search.value.length == 0) {
        const chunks = splitFeed(feed, form.pagination.value)
        printFeed(chunks)   

        return  
    }
    
    const regex = new RegExp(search, 'gi')

    feed = objToArr(feed)
    const filtered = filterFeed(feed, type, regex)

    const newfeed = arrToObj(filtered)

    sessionStorage.setItem('storedFeed', JSON.stringify(newfeed))

    const chunks = splitFeed(filtered, form.pagination.value)

    clearFeed()

    if(chunks.length != 0) {    
        printFeed(chunks)
    }
})

document.getElementById('search-type').addEventListener('change', async e => {
    const search = form.search.value
    const type = form['search-type'].value

    let feed = await getFeed(options) 
    
    const regex = new RegExp(search, 'gi')

    feed = objToArr(feed)
    const filtered = filterFeed(feed, type, regex)

    const newfeed = arrToObj(filtered)

    sessionStorage.setItem('storedFeed', JSON.stringify(newfeed))

    const chunks = splitFeed(filtered, form.pagination.value)

    clearFeed()

    if(chunks.length != 0) {    
        printFeed(chunks)
    }
})

document.addEventListener('DOMContentLoaded', async e => {
    if(form.search.value === '') {
        const feed = await getFeed(options)
        const chunks = splitFeed(feed, form.pagination.value)
        printFeed(chunks)

        return
    }

    let storedFeed = sessionStorage.getItem('storedFeed')
    if(storedFeed !== null && Object.keys(storedFeed).length > 2) {
        const orderedBy = sessionStorage.getItem('orderedBy')
        const pagination = sessionStorage.getItem('perPage')

        storedFeed = JSON.parse(storedFeed)

        storedFeed = orderedBy ? orderBy(storedFeed, form.orderBy.value) : storedFeed
        storedFeed = pagination ? await perPage(storedFeed) : storedFeed

        const chunks = splitFeed(storedFeed, form.pagination.value)

        clearFeed()
        printFeed(chunks)
        
        return
    }
   
    const feed = await getFeed(options)
    const chunks = splitFeed(feed, form.pagination.value)

    printFeed(chunks)
})