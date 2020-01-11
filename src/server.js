require('dotenv').config()
const knex = require('knex')
const app = require('./app')
const  { PORT, DB_URL } = require('./config')
const BookmarksService = require('./bookmarks-service')

const db = knex({
    client: 'pg',
    connection: DB_URL,
})

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

console.log(BookmarksService.getAllBookmarks())

app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`))