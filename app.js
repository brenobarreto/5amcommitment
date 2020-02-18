//Imports Express module
const express = require('express');

//Import body-parser module
const bodyParser = require('body-parser');

//Initiates Express for this app
const app = express();

//Set body-parser to parse HTML data
app.use(bodyParser.urlencoded({ extended: false }));

//Sets pug as our templating language
app.set('view engine', 'pug');

//Defines what is rendered in the root route
app.get('/', (req, res) => {
    res.render('index', {"user": "John"});
});

app.listen(3001, console.log('The server has started on port 3001'));