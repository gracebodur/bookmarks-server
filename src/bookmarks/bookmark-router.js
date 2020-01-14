const express = require('express')
const xss = require('xss')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const validUrl = require('valid-url')
const BookmarksService = require('../bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

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

    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body
        const newBookmark = { title, url, rating, description }

        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
              return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
              })
            }
          }

        // if(rating < 0 || rating > 5 || !Number.isInteger(rating)) {
        //      logger.error(`Rating must be a number between 0 and 5`)
        //      return res
        //         .status(400).json({
        //             error: { message: `Missing 'rating' in request body` }
        //     })
        // }

        if(!validUrl.isWebUri(url)) {
             logger.error(`Url is invalid`)
             return res
                 .status(400)
                 .send('Url must be formed as HTTP or HTTPS')
         }

        // const id = uuid()
        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            logger.info(`Bookmark with id: ${bookmark.id} created`)
            res
            .status(201)
            .location(`/bookmarks/${bookmark.id}`)
            .json(bookmark)
        })
        .catch(next)
    })
        
bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.getBookmarksById(req.app.get('db'), bookmark_id)
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark with id ${bookmark_id} not found.`)
                    return res.status(404).json({
                        error: { message: `Bookmark Not Found`}
                    })  
                }
                res.json({
                    id: bookmark.id,
                    title: xss(bookmark.title), //sanitize title
                    url: bookmark.url,
                    rating: bookmark.rating,
                    description: xss(bookmark.description), //sanitize description
                })
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