# Bookmarks Server - Assignment!

Build an API for the Bookmarks client supporting GET, POST and DELETE.

## Scripts

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Requirements

Use the boilerplate to start a new application named bookmarks-server

1. Configure logging and API key handling middleware on the server
2. Write a route handler for the endpoint GET /bookmarks that returns a list of bookmarks
3. Write a route handler for the endpoint GET /bookmarks/:id that returns a single bookmark with the given ID, return 404 Not Found if the ID is not valid
4. Write a route handler for POST /bookmarks that accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation.
5. Write a route handler for the endpoint DELETE /bookmarks/:id that deletes the bookmark with the given ID.