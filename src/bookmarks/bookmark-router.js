const path = require('path')
const express = require('express')
const xss = require('xss')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')
const validUrl = require('valid-url')
const BookmarksService = require('./bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    rating: bookmark.rating,
    description: xss(bookmark.description)
 })

bookmarkRouter
    .route('/')
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
            if(rating < 0 || rating > 5 || !Number.isInteger(rating)) {
                logger.error(`Rating must be a number between 0 and 5`)
                return res.status(400).json({
                error: { message: `Missing 'rating' in request body` }
                })
            }
            if(!validUrl.isWebUri(url)) {
            logger.error(`Url is invalid`)
            return res
                .status(400).json({
                    error: { message: `Missing 'url' in request body` }
                })
            }
        }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            logger.info(`Bookmark with id: ${bookmark.id} created`)
            res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
            .json(serializeBookmark(bookmark))
        })
        .catch(next)
    })
        
bookmarkRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getBookmarksById(
          req.app.get('db'),
          req.params.bookmark_id
        )
          .then(bookmark => {
            if (!bookmark) {
              return res.status(404).json({
                error: { message: `Bookmark doesn't exist` }
              })
            }
            res.bookmark = bookmark // save the article for the next middleware
            next() // don't forget to call next so the next middleware happens!
          })
          .catch(next)
      })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const { bookmark_id } = req.params
  
        BookmarksService.deleteBookmark(
            req.app.get('db'), 
            bookmark_id)
           .then(deletedBookmark => {
               logger.info(`Bookmark with id ${bookmark_id} deleted`)
               res.status(204).end()
           })
           .catch(next)
     })
     .patch(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body
        const bookmarkToUpdate = { title, url, rating, description }
        
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
          if (numberOfValues === 0) {
            return res.status(400).json({
              error: {
                message: `Request body must contain either 'title', 'url', 'rating' or 'description'`
              }
            })
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.bookmark_id,
            bookmarkToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
      })

    module.exports = bookmarkRouter

    