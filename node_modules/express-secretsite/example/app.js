/**
 * Very simple express app including the secret site module
 */

var express = require('express');

var app = express();

//include the secret middleware with defaults for everything
//TODO: Once published, include the actual express-secretsite module here
app.use(require('../index')());


app.get('/', function (req, res) {
    res.send('Hello World')
});

app.listen(3000);