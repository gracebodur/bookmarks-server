const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let db
   
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`GET /bookmarks`, () => {
        context(`Given no bookmarks`, () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })
        
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                .get('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, testBookmarks)
            })
        })
    })

    describe(`GET /bookmarks/:id`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404 when bookmarks doesn't exist`, () => {
                return supertest(app)
                    .get(`/bookmarks/123`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: {message: `Bookmark Not Found`}})
            })
        })

        context(`Given there are bookmarks in the database`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })

        context(`Given an XSS attack article`, () => {
            const maliciousBookmarks = {
              id: 911,
              title: 'Naughty naughty very naughty <script>alert("xss");</script>',
              url: 'https://www.maliciousbookmark.com',
              rating: 5,
              description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
            }
       
            beforeEach('insert malicious bookmark', () => {
              return db
                .into('bookmarks')
                .insert([ maliciousBookmarks ])
            })
       
            it('removes XSS attack content', () => {
              return supertest(app)
                .get(`/bookmarks/${maliciousBookmarks.id}`)
                .expect(200)
                .expect(res => {
                  expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                  expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                })
            })
          })
    })

    describe(`POST /bookmarks`, () => {
        it(`creates a bookmark, responding with 201 and the new bookmark`,  function() {
        const newBookmark = {
            title  : "Test POST bookmark",
            url    : "https://www.test.com/",
            rating : 3,
            description: "Test new bookmark",
         }
          return supertest(app)
            .post('/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(newBookmark)
            .expect(201)
            .expect(res => {
                 expect(res.body.title).to.eql(newBookmark.title)
                 expect(res.body.url).to.eql(newBookmark.url)
                 expect(res.body.rating).to.eql(newBookmark.rating)
                 expect(res.body.description).to.eql(newBookmark.description)
                 expect(res.body).to.have.property('id')
                 expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
            })
            .then(res => 
            supertest(app)
                .get(`/bookmarks/${res.body.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(res.body)
            )
        })
        
        const requiredFields = ['title', 'url', 'rating', 'description']

           requiredFields.forEach(field => {
            const newBookmark = {
                title  : "Test POST bookmark",
                url    : "https://www.test.com/",
                rating : 3,
                description: "Test new bookmark",
              }
                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]
                return supertest(app)
                  .post('/bookmarks')
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .send(newBookmark)
                  .expect(400, {
                    error: { message: `Missing '${field}' in request body` }
                })
            })
        })

    describe.only(`DELETE /bookmarks/:id`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
              const bookmarkId = 123456
              return supertest(app)
                .delete(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
       })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
         
            beforeEach('insert bookmarks', () => {
                return db
                 .into('bookmarks')
                 .insert(testBookmarks)
            })
         
            it('responds with 204 and removes the bookmark', () => {
                const idToRemove = 2
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                return supertest(app)
                .delete(`/bookmarks/${idToRemove}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/bookmarks`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedBookmarks)
                    )
                })
            })
        })
    })
})
