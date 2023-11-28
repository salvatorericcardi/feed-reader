import assert from 'node:assert'
import { describe, it } from 'node:test'

import { JSDOM } from 'jsdom'
import { LocalStorage } from 'node-localstorage'

import { filterFeed, getFeed, splitFeed } from '../src/scripts/functions.js'
import { arrToObj, getAllFromLocalStorage, objToArr } from '../src/scripts/utilities.js'

/*** Global variables *****************************************************/
const window = await JSDOM.fromFile('index.php', {contentType: 'text/html'}).then(dom => dom.window)

if (typeof localStorage === "undefined" || localStorage === null) {   
    globalThis.localStorage = new LocalStorage('/scratch')
}

localStorage.setItem('feed-inps', 'https://www.inps.it/it/it.rss.news.xml')
localStorage.setItem('feed-agenzia-delle-entrate', 'https://www.agenziaentrate.gov.it/portale/c/portal/rss/entrate?idrss=79b071d0-a537-4a3d-86cc-7a7d5a36f2a9')

const data = {
    stored: getAllFromLocalStorage(localStorage),
    current: null,
}

const options = {
    method: 'post',
    body: JSON.stringify(data),
}

const feed = await getFeed(options)

/*** Feed suite ***********************************************************/
describe('Feed suite', () => {
    it('getFeed function', t => {
        // return error message if feed is not an object
        assert(typeof feed == 'object', 'feed is not an object')
    })
    
    it('splitFeed function', t => {
        const chunks = splitFeed(feed, 5)
        
        // return error message if feed is not an array
        assert(Array.isArray(chunks), 'chunks is not an array')
    })
    
    it('filterFeed function', t => {
        let okay
        let okayByTitle
    
        const filtered = filterFeed(feed, 'all', /inps/gi)
        if(filtered.length > 0) {
            filtered.forEach(el => {
                // false if ok contains inps
                okay = Object.keys(el).every(key => el[key].search(/inps/gi) > -1 ? false : true)
            })
    
            // if false there is something wrong and return message
            assert(!okay, 'filterFeedByAll broken function')
        } else {
            assert(filtered.length, 'filter returns zero results')
        }
    
        const filteredByTitle = filterFeed(feed, 'title', /inps/gi)
        if(filteredByTitle.length > 0) {
            filteredByTitle.forEach(el => {
                okayByTitle = el['title'].search(/inps/gi) > -1 ? false : true
            })
    
            // if false there is something wrong and return message
            assert(!okayByTitle, 'filterFeedByTitle broken function')
        } else {
            assert(filteredByTitle.length, 'filterByTitle returns zero results')
        }
    })
})

/*** Utilites suite *******************************************************/
describe('Utilities suite', () => {
    it('getAllFromLocalStorage function', t => {
        // return error message if feed is not an object
        assert(localStorage.length == getAllFromLocalStorage(localStorage).length, 'getAllFromLocalStorage broken function')
    })

    it('arrToObj function', t => {
        const array = []

        // return error message if func not returns an object
        assert(typeof arrToObj(array) == 'object', 'arrToObj broken function')
    })

    it('objToArr function', t => {
        const object = {}

        // return error message if func not returns an array
        assert(Array.isArray(objToArr(object)), 'objToArr broken function')
    })
})