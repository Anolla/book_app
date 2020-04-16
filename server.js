'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent')
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const methodOverride = require('method-override'); //METHOD OVVERIDE
const app = express();
app.use(cors());

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL)
client.on('error', (err) => console.log(err));


// to read ang get the data in the req.body ////middlewares
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); //METHOD OVVERIDE

// setting the view engine
app.set('view engine', 'ejs');


app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);
app.get('/books/:id', selectBookshelf);

app.get('/', (req, res) => {
    // render the index.ejs from the views folder
    const SQL = 'SELECT * FROM books;';
    client.query(SQL)
        .then((data => {
            res.render('pages/index', { books: data.rows });
        }))
        .catch((err) => {
            errorHandler(err, req, res);
        })
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new');
});

// app.get('/searches/show', (req, res) => {
//     res.render('pages/searches/new')
// })

app.post('/searches/show', (req, res) => {
    let url;
    // console.log('udukdjzkoilujlkjk')
    if (req.body.search === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.input}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}:${req.body.input}`
    }
    return superagent.get(url)
        .then(data => {
            let books = data.body.items.map((element) => {
                return new Book(element);
            })

            res.render('pages/searches/show', { books: books })
        })

    .catch((err) => {
        errorHandler(err, req, res);
    });

});


app.get('/books/:id', (req, res) => {
    const SQL = 'SELECT * FROM books WHERE id=$1;';
    const safeValue = [req.params.id];
    client
        .query(SQL, safeValue)
        .then((data) => {
            // console.log(data)
            res.render('pages/books/show', { book: data.rows[0] });
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
})

app.post('/books', (req, res) => {
    const { author, title, isbn, image_url, description, bookshelf } = req.body;
    const SQL =
        'INSERT INTO books (author,title,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    const safeValues = [author, title, isbn, image_url, description, bookshelf];
    client
        .query(SQL, safeValues)
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });

})

function updateBook(req, res) {
    const { author, title, isbn, image_url, description, bookshelf } = req.body;
    const SQL =
        'UPDATE books SET author=$1,title=$2,isbn=$3,image_url=$4,description=$5,bookshelf=$6 WHERE id=$7';
    const safeValues = [author, title, isbn, image_url, description, bookshelf, req.params.id];
    client
        .query(SQL, safeValues)
        .then((results) => res.redirect(`/`))
        .catch((err) => errorHandler(err, req, res));

}

function deleteBook(req, res) {
    const SQL = 'DELETE FROM books WHERE id=$1';
    const safeValue = [req.params.id];
    client
        .query(SQL, safeValue)
        .then((results) => res.redirect('/'))
        .catch((err) => errorHandler(err, req, res));

}

function selectBookshelf(req, res) {
    let SQL = `SELECT * FROM books WHERE id = $1;`
    let SQL2 = 'SELECT DISTINCT bookshelf FROM books;'
    let bookId = [req.params.id];
    let arrayOfBookshelf = [];
    client.query(SQL2)
        .then(result => {
            arrayOfBookshelf = result.rows;
        })
    return client.query(SQL, bookId)
        .then(result => {
            res.render('./pages/books/show', { book: result.rows[0], arrayOfBookshelf: arrayOfBookshelf })
        })
}



function Book(data) {

    this.Title = (true && data.volumeInfo.title) || 'Title Not Found !';
    this.Authors = (data.volumeInfo.authors) ? data.volumeInfo.authors : 'Author Not Found !';
    this.Description = (data.volumeInfo.description) ? data.volumeInfo.description : 'Descripton Not Found !';
    this.img_url = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = (data.volumeInfo.industryIdentifiers) ? data.volumeInfo.industryIdentifiers : 'ISBN Not Found !';

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