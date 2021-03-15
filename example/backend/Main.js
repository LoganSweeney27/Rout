const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Router = require('./Router');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');


app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());

console.log('test')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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

app.post('/sendCode', (req, res) => {
    let email = req.body.email;
    let code = req.body.forgotCode;
    let username = req.body.username;

    let transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.gmail.com',
        service: 587,
        auth: {
        user: 'noreply.rout.link@gmail.com',
        pass: 'BKRpJG2D6w57KBMb6hkP4iM3'
    }
    }));
    let mailOptions = {
        from: '"Rout Helper" <noreply.rout.link@gmail.com',
        to: email,
        subject: "Password Reset",
        text: 
            'Hello ' + username + ', we have noticed your attempt to reset your password. Please enter this code when prompted : ' + code 
    }
    transporter.sendMail(mailOptions, function (err, res) {
        if(err){
            console.log('Error');
        } else {
            console.log('Email Sent');
        }
    })
});

new Router(app, db);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
