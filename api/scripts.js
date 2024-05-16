import { clearFeed, filterFeed, getFeed, perPage, printFeed, splitFeed } from "./lib/functions.js"
import { arrToObj, getAllFromLocalStorage, objToArr, orderBy } from "./lib/utilities.js"

/** Global variables */
var db
var page = 0

const form = document.forms.namedItem('feed-reader')

const data = {
    stored: getAllFromLocalStorage(localStorage),
    current: null,
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

    const feed = await getFeed(data)
    const chunks = splitFeed(feed, form.pagination.value)

    printFeed(chunks)
})

document.getElementById('orderBy').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed')
    storedFeed = JSON.parse(storedFeed)

    let feed = storedFeed ? storedFeed : await getFeed(data)
    feed = objToArr(feed)
    feed = orderBy(feed, form.orderBy.value)

    const chunks = splitFeed(feed, form.pagination.value)

    clearFeed()
    printFeed(chunks)
})

document.getElementById('pagination').addEventListener('change', async e => {
    let storedFeed = sessionStorage.getItem('storedFeed')
    storedFeed = JSON.parse(storedFeed)
    
    const feed = storedFeed ? storedFeed : await getFeed(data)
    const chunks = await perPage(feed, form.pagination.value)

    clearFeed()
    printFeed(chunks)
})

document.getElementById('search').addEventListener('change', async e => {
    const search = form.search.value
    const type = form['search-type'].value
    
    // let storedFeed = sessionStorage.getItem('storedFeed')
    // storedFeed = JSON.parse(storedFeed)

    let feed = await getFeed(data)
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

    let feed = await getFeed(data) 
    
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
        const feed = await getFeed(data)
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
   
    const feed = await getFeed(data)
    const chunks = splitFeed(feed, form.pagination.value)

    printFeed(chunks)
})