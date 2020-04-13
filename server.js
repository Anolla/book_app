'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent')
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const app = express();
app.use(cors());

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL)
client.on('error', (err) => console.log(err));

// to read ang get the data in the req.body ////middlewares
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }));

// setting the view engine
app.set('view engine', 'ejs');


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
        url = `https://www.googleapis.com/books/v1/volumes?q= in${req.body.search}:${req.body.input}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q= in${req.body.search}:${req.body.input}`
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
    response.status(404).send('This page is not found');
});

// function errorHandler(error, request, response) {
//     response.status(500).send(error);
// }

function errorHandler(err, req, res) {
    res.status(500).render('pages/error.ejs', { error: err });
}

client.connect().then(() => {
    app.listen(PORT, () => console.log('Running on port', PORT));
});