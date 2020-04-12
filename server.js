'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent')
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const app = express();
app.use(express.static('./public'))
    // to read ang get the data in the req.body
app.use(express.urlencoded({ extended: true }));

app.use(cors());
// setting the view engine
app.set('view engine', 'ejs');

app.get('/hello', (req, res) => {
    // render the index.ejs from the views folder
    res.render('pages/index');
});

app.get('/new', (req, res) => {
    res.render('pages/searches/new')
})

app.post('/searches', (request, response) => {

    let keyWord = request.body.searched;
    let filter = request.body.searchFilter;

    let apiURL = `https://www.googleapis.com/books/v1/volumes?q=${keyWord}+in${filter}`
    superagent.get(apiURL).then((apiRes) => {

        let bookData = apiRes.body.items;

        let book = bookData.map(item => {
            return new Book(item.volumeInfo);
        })
        response.render('pages/searches/show', { book: book });

    }).catch((err) => errorHandler(err, request, response))

})

function Book(data) {
    this.authors = data.volumeInfo.authors;
    this.title = data.volumeInfo.title;
    this.description = data.volumeInfo.description;
    this.img_url = data.volumeInfo.imageLinks.thumbnail;
}
app.use('*', (request, response) => {
    response.status(404).send('Page not found');
});

function errorHandler(error, request, response) {
    response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Running on port ${PORT}`));