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
    // .post(bodyParser, (req, res) => {
    //     const { title, url, rating = 1, desc } = req.body


    // })

    module.exports = bookmarkRouter