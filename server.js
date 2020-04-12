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



app.listen(PORT, () => console.log(`Running on port ${PORT}`));