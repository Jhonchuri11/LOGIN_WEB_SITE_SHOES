const express = require('express');
const ejs = require('ejs');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');

const loginRoutes = require('./routes/login');

const app = express();
app.set('port', 4000);

app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs'); 

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(myconnection(mysql,{
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'restapi_website_shoes'
}));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.listen(app.get('port'), () => {
    console.log('Listening on port', app.get('port'));
});

app.get('/', (req, res) => {
    const username = req.session.loggedin ? req.session.name : null;
    res.render('index', { username }); 
});

app.use('/', loginRoutes);

app.get('/admin', (req,res) => {
    if(req.session.loggedin && req.session.role === 'administrador') {
        res.render('admin', { name: req.session.name });
    } else {
        res.redirect('/login');
    }
});
