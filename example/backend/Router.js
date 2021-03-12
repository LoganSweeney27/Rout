const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");


class Router {
    constructor(app, db) {
        this.login(app, db);
        this.logout(app, db);
        this.isLoggedIn(app, db);
        this.register(app, db);
    }
    register(app, db) {
            app.post('/Register', (req, res) => {
                let username = req.body.username;
                let password = req.body.password;
                let profilePicture = req.body.profilePicture;
                let nickname = req.body.nickname;
                let email = req.body.email;
                console.log(nickname);

                username = username.toLowerCase();
                if (username.length > 32 || password.length > 32) {
                    res.json({
                        success: false,
                        msg: 'Error, username or password exceeds 32 characters.'
                    })
                    return;
                } else if (nickname.length == 0) {
                    res.json({
                        success: false,
                        msg: 'You have to have a nickname!'
                    })
                    return;
                } else if (email.length == 0) {
                    res.json({
                        success: false,
                        msg: 'You have to have an email!'
                    })
                    return;
                } else if (profilePicture == 0) {
                    profilePicture = 'https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg'
                } else {
                    password = bcrypt.hashSync(password, 9);
                    var send={email:email, password:password, profilePicture:profilePicture
                    , nickname:nickname, username:username}
                    var query = db.query("INSERT INTO user set ? ",send,
                    function(err, rows) {
                        if (err){
                            res.status(400).json("DB Error, please contact administrator.");
                            console.log("Error in DB for inserting");
                        } else {
                            res.status(200).json('Registered Successfully!')
                        }
                    });
                }
            });
    }
    login(app, db) {
        app.post('/login', (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            console.log(username);

            username = username.toLowerCase();

            if (username.length > 32 || password.length > 32) {
                res.json({
                    success: false,
                    msg: 'Error, username or password exceeds 32 characters'
                })
                return;
            }
            let cols = [username];
            db.query('SELECT * FROM user WHERE username = ? LIMIT 1', 
            cols, (err, data, fields) => {
                if (err) {
                    res.json({
                        success: false,
                        msg: 'User does not exist.'
                    })
                    return;
                }
                // if user is found
                if (data && data.length == 1) {
                    bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
                        if (verified) {
                            req.session.userID = data[0].id;
                            res.json({
                                success: true,
                                username: data[0].username
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: 'Password Incorrect'
                            })
                        }
                    });
                } else {
                    //User does not exist
                    res.json({
                        success: false,
                        msg: 'User does not exist.'
                    })
                }
            });
        });
    };


    
    logout(app, db) {
        app.post('/logout', (req, res) => {
            if (req.session.userID) {
                req.session.destroy();
                res.json({
                    success: true
                })
                return true;
            } else {
                res.json({
                    success: false
                })
                return false;
            }
        })
    }

    isLoggedIn(app, db) {
        app.post('/isLoggedIn', (req, res) => {
            if (req.session.userID) {
                let cols = [req.session.userID];
                db.query('SELECT * FROM user WHERE id = ? LIMIT 1', 
                    cols, (err, data, fields) => {
                    
                    if (data && data.length === 1) {
                        res.json({
                            success: true,
                            username: data[0].username
                        })
                        return true;
                    } else {
                        res.json({
                            success: false
                        })
                    }
                 })
            } else {
                res.json({
                    success: false
                })
            }
        });
    }
}
module.exports = Router;