const BookmarksService = {
    getAllBookmarks(knex) {
        return knex
        .select('*')
        .from('bookmarks')
    },
    insertBookmark(knex, newBookmarks) {
        return knex
            .insert(newBookmarks)
            .into('bookmarks')
            .returning('*')
            .then(rows => rows[0])
        },
    getBookmarksById(knex, id) {
        return knex
            .from('bookmarks')
            .select('*')
            .where('id', id)
            .first()
        },
    deleteBookmark(knex, id) {
        return knex('bookmarks')
            .where({ id })
            .delete()
    },
    updateBookmark(knex, id, newBookmarksFields) {
        return knex('bookmarks')
        .where({ id })
        .update(newBookmarksFields)
    }
} 

module.exports = BookmarksService