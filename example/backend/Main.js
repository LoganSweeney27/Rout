const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Router = require('./Router');

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());

console.log('test')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hHtY6TGaVe68QiGrMRrUFHhy',
    database: 'myapp'
});

db.connect(function(err) {
    if (err) {
        console.log('DB error');
        throw err;
        return false;
    }
});

const sessionStore = new MySQLStore({
    expiration: (7200000),
    endConnectionOnClose: false
}, db);

app.use(session({
    key: 'kl1j23lkjlk44lk2j1lkj',
    secret: 'kldwajk2j1k3kl8s67a89',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (7200000),
        httpOnly: false
    }
}));

new Router(app, db);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
