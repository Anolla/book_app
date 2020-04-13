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


app.get('/', (req, res) => {
    // render the index.ejs from the views folder
    res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new');
});

app.get('/searches/show', (req, res) => {
    res.render('pages/searches/new')
})

app.post('/searches/show', (req, res) => {
    let url = `https://www.googleapis.com/books/v1/volumes?q=quilting`
    if (req.body.search === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.keyword}`
    }
    return superagent.get(url)
        .then(data => {
            let books = data.body.items.map((element) => {
                return new Book(element)
            })
            res.render('pages/searches/show', { books: books })
        }).catch((err) => {
            errorHandler(err, req, res);
        });
});



function Book(data) {
    this.Title = data.volumeInfo.title;
    this.Authors = data.volumeInfo.authors;
    this.Description = data.volumeInfo.description;
    this.img_url = data.volumeInfo.imageLinks.thumbnail;
}


app.use('*', (request, response) => {
    response.status(404).send('The page is not found');
});

function errorHandler(error, request, response) {
    response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Running on port ${PORT}`));