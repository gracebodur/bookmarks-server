const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const validUrl = require('valid-url')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, rating = 1, desc } = req.body

        if(!title || !url || !desc) {
            logger.error(`Title, url and description are required`)
            return res.status(400).send('Title, url and description are required')
        }

        if(rating < 0 || rating > 5 || !Number.isInteger(rating)) {
            logger.error(`Rating must be a number between 0 and 5`)
        }

        if(!validUrl.isWebUri(url)) {
            logger.error(`Url is invalid`)
            return res.status(400).send('Url must be formed as HTTP or HTTPS')
        }

        const id = uuid()
        const bookmark = {
            id,
            title,
            url,
            rating,
            desc
        }

        bookmarks.push(bookmark)
        
        logger.info(`Bookmark with id: ${id} created`)

        res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark)
    })

    module.exports = bookmarkRouter