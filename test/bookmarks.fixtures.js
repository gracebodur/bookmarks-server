function makeBookmarksArray() {
    return [
        {
            id     : 1,
            title  : "Google",
            url    : "http://www.google.com",
            rating : "3",
            desc   : "Test description one",
        },
        {
            id     : 2,
            title  : "Thinkful",
            url    : "http://www.thinkful.com",
            rating : "5",
            desc   : "Test description two",
        },
        {
            id     : 3,
            title  : "Github",
            url    : "http://www.github.com",
            rating : "4",
            desc   : "Test description three",
        },
    ] 
}

module.exports = { makeBookmarksArray }
