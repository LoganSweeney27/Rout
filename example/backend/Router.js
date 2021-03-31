const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");


class Router {
    constructor(app, db) {
        this.login(app, db);
        this.logout(app, db);
        this.isLoggedIn(app, db);
        this.register(app, db);
        this.sendCode(app, db);
        this.submitCode(app, db);
        this.getCompare(app, db);
        this.getLine(app, db);
        this.getPrevRoutes(app, db);
        this.sendCodeFA(app, db);
    }

    submitCode(app, db) {
        app.post('/submitCode', (req, res) => {
            let email = req.body.email;
            let FACODE = req.body.forgotCode;
            let password = req.body.password;
            console.log(FACODE);
            
            let cols = [email];
            db.query('SELECT * FROM user WHERE email = ? LIMIT 1', 
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
                    if (FACODE = data[0].FACODE) {
                        password = bcrypt.hashSync(password, 9);
                        var sql = "UPDATE user set password = \"" + password + "\" WHERE email = \"" + email + "\"";
                        var query = db.query(sql,
                            function(err, rows) {
                                if (err){
                                    console.log(err);
                                    console.log("Error in DB for updating password");
                                } else {
                                    console.log("Successfully changed password");
                                }
                            });
                        res.json({
                            success: true,
                            msg: 'Password Updated Successfully'
                        })

                    } else {
                        res.json({
                            success: false,
                            msg: 'Incorrect 2FA Code'
                        })
                    }
                } else {
                    //User does not exist
                    res.json({
                        success: false,
                        msg: 'User does not exist.'
                    })
                }
            });
            
            
        });
    }
    // Sends 2FA code
    sendCodeFA(app, db) {
        app.post('/sendCodeFA', (req, res) => {
            let FACODE = Math.random().toString(20).substr(2, 6);
            let username = req.body.username;
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
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'noreply.rout.link@gmail.com',
                            pass: 'BKRpJG2D6w57KBMb6hkP4iM3'
                        }
                    });
                    let mailOptions = {
                        from: '"Rout Helper" <noreply.rout.link@gmail.com',
                        to: data[0].email,
                        subject: "Two Factor Login",
                        text: 
                            'Hello ' + username + ', we have noticed your attempt to login. Please enter this code when prompted : ' + FACODE 
                    }
                    transporter.sendMail(mailOptions, function (err, res) {
                        if(err){
                            console.log('Error in Mail');
                            console.log(err);
                        } else {
                            var sql2 = "UPDATE user set FACODE = \"" + FACODE + "\" WHERE email = \"" + data[0].email + "\"";
                            var query = db.query(sql2,
                            function(err, rows) {
                                if (err){
                                    console.log(err);
                                    console.log("Error in DB for updating 2FA Code");
                                } else {
                                    console.log("Hello");
                                }
                            });
                        }
                    })
                } else {
                    //User does not exist
                    res.json({
                        success: false,
                        msg: 'User does not exist.'
                    })
                }
            });
        });
    }
    sendCode(app, db) {
        app.post('/sendCode', (req, res) => {
            let email = req.body.email;
            let FACODE = Math.random().toString(20).substr(2, 6);
            let username = req.body.username;
        
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'noreply.rout.link@gmail.com',
                    pass: 'BKRpJG2D6w57KBMb6hkP4iM3'
                }
            });
            let mailOptions = {
                from: '"Rout Helper" <noreply.rout.link@gmail.com',
                to: email,
                subject: "Password Reset",
                text: 
                    'Hello ' + username + ', we have noticed your attempt to reset your password. Please enter this code when prompted : ' + FACODE 
            }
            transporter.sendMail(mailOptions, function (err, res) {
                if(err){
                    console.log('Error');
                } else {
                    console.log('Email Sent');
                    var sql = "UPDATE user set FACODE = \"" + FACODE + "\" WHERE email = \"" + email + "\"";
                    var query = db.query(sql,
                    function(err, rows) {
                        if (err){
                            console.log(err);
                            console.log("Error in DB for updating 2FA Code");
                        } else {
                            console.log("Hello");
                        }
                    });

                }
            })
        });
    }
    register(app, db) {
            app.post('/Register', (req, res) => {
                let username = req.body.username;
                let password = req.body.password;
                let profilePicture = req.body.profilePicture;
                let nickname = req.body.nickname;
                let email = req.body.email;
                let dev = 0;
                let enableFA = req.body.enableFA;
                let FACODE = "Won't find me!";
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
                    , nickname:nickname, username:username, dev:dev, FACODE:FACODE, enableFA:enableFA}
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
            let FACODE = req.body.forgotCode;
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
                            if (data[0].enableFA == 1) {
                                if (FACODE == data[0].FACODE) {
                                    req.session.userID = data[0].id;
                                    res.json({
                                        success: true,
                                        username: data[0].username,
                                        email : data[0].email
                                    })
                                } else {
                                    res.json({
                                        success: false,
                                        msg: '2FA Code Incorrect'
                                    })
                                }
                            } else {
                                req.session.userID = data[0].id;
                                res.json({
                                    success: true,
                                    username: data[0].username,
                                    email : data[0].email
                                })
                            }
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





    // STATISTICS PAGE QUERIES
    getCompare(app, db) {
        app.post('/getCompare', (req, res) => {
            let dist = req.body.dist;
            let userID = req.body.userID;
        
            var sql = "SELECT distance, time FROM prevroutes WHERE userID = \"" + userID + "\" AND distance BETWEEN \"" + (parseFloat(dist) - parseFloat(dist * 0.1)) + "\" AND \"" + (parseFloat(dist) + parseFloat(dist * 0.1)) + "\" ORDER BY time";
            var query = db.query(sql,
            function(err, data) {
                if (err){
                    console.log(err);
                    console.log("Error in DB for retrieving route.");
                    res.json({
                        success: false,
                    })
                } else {
                    console.log("Success");
                    if (data && data.length >= 1) {
                        res.json({
                            success: true,
                            dist: data[0].distance,
                            time: data[0].time
                        })
                        return true;
                    } else {
                        res.json({
                            success: false,
                        })
                    }
                }
            });
        });
    }

    getLine(app, db) {
        app.post('/getLine', (req, res) => {
            let userID = req.body.userID;
        
            var sql = "SELECT calories, date FROM prevroutes WHERE userID = \"" + userID + "\" ORDER BY date";
            var query = db.query(sql,
            function(err, data) {
                if (err){
                    console.log(err);
                    console.log("Error in DB for retrieving route.");
                    res.json({
                        success: false,
                    })
                } else {
                    console.log("Success");
                    if (data && data.length >= 1) {
                        let dataArray = [];
                        let labelsArray = [];
                        for (let i = 0; i < data.length; i++) {
                            dataArray[i] = data[i].calories;
                            labelsArray[i] = data[i].date;
                        }
                        res.json({
                            success: true,
                            data: dataArray,
                            labels: labelsArray
                        })
                        return true;
                    } else {
                        res.json({
                            success: false,
                        })
                    }
                }
            });
        });
    }

    getPrevRoutes(app, db) {
        app.post('/getPrevRoutes', (req, res) => {
            let userID = req.body.userID;
        
            var sql = "SELECT distance, time, calories, date FROM prevroutes WHERE userID = \"" + userID + "\" ORDER BY date";
            var query = db.query(sql,
            function(err, data) {
                if (err){
                    console.log(err);
                    console.log("Error in DB for retrieving routes.");
                    res.json({
                        success: false,
                    })
                } else {
                    console.log("Success");
                    if (data && data.length >= 1) {
                        let distanceArray = [];
                        let timeArray = [];
                        let caloriesArray = [];
                        let dateArray = [];
                        for (let i = 0; i < data.length; i++) {
                            distanceArray[i] = data[i].distance;
                            timeArray[i] = data[i].time;
                            caloriesArray[i] = data[i].calories;
                            dateArray[i] = data[i].date;
                        }
                        res.json({
                            success: true,
                            distances: distanceArray,
                            times: timeArray,
                            calories: caloriesArray,
                            dates: dateArray
                        })
                        return true;
                    } else {
                        res.json({
                            success: false,
                        })
                    }
                }
            });
        });
    }
}
module.exports = Router;