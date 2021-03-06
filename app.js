var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');

// mongodb connect
mongoose.connect("mongodb://localhost:27017/jwtAuth", { useNewUrlParser: true, useUnifiedTopology: true },(err)=>{
    console.log("connected", err ? err: true);   
})

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/articles', articlesRouter);


module.exports = app;
