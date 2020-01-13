const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const validUrl = require('valid-url')
const BookmarksService = require('../bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

// const bookmarkForm = bookmark => ({
//     id: bookmarks.id,
//     title: bookmarks.title,
//     url: bookmarks.url,
//     desc: bookmarks.desc,
//     rating: Number(bookmarks.rating),
// })

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
            const knexInstance = req.app.get('db')
            BookmarksService.getAllBookmarks(knexInstance)
                .then(bookmarks => {
                    res.json(bookmarks)
                })
                .catch(next)
        })

    .post(bodyParser, (req, res) => {
        const { title, url, rating = 1, desc } = req.body

        if(!title || !url || !desc) {
            logger.error(`Title, url and description are required`)
            return res
                .status(400)
                .send('Title, url and description are required')
        }

        if(rating < 0 || rating > 5 || !Number.isInteger(rating)) {
            logger.error(`Rating must be a number between 0 and 5`)
        }

        if(!validUrl.isWebUri(url)) {
            logger.error(`Url is invalid`)
            return res
                .status(400)
                .send('Url must be formed as HTTP or HTTPS')
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

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    // .get((req, res) => {
    //     const { id } = req.params

    //     const bookmark = bookmarks.find(b => b.id == id)

    //     if(!bookmark) {
    //         logger.error(`Bookmark with id: ${id} not found.`)
    //         return res
    //             .status(404)
    //             .send('Not found')
    //     }

    //     res.json(bookmark)
    .get((req, res, next) => {
            // const knexInstance = req.app.get('db', bookmark_id)
            const bookmark_id = req.params
            BookmarksService.getBookmarksById(req.app.get('db'), bookmark_id)
                .then(bookmark => {
                    if(!bookmark) {
                        logger.error(`Bookmark with id ${bookmark_id} not found.`)
                        return res.status(404)
                            .send({ error: { message: `Bookmark not found`}})
                    }
                    res.json(bookmarks)
                })
                .catch(next)
    })

    .delete((req, res) => {
        const { id } = req.params

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if(bookmarkIndex === -1) {
            logger.error(`Bookmark with id: ${id} not found.`)
            return res
                .status(400)
                .send('Not found')
        }



        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id: ${id} deleted.`)

        res
        .status(204)
        .end()
    })

    module.exports = bookmarkRouter