const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const { parseIsolatedEntityName } = require('typescript');


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
        this.changeNickname(app, db);
        this.changeProfilePicture(app, db);
        this.sendRoute(app, db);
        this.updateRating(app, db);
        this.getRouteID(app, db);
        this.getResponse(app, db);
    }


    changeNickname(app, db) {
        app.post('/changeNickname', (req, res) => {
            let nickname = req.body.nickname;
            console.log(nickname);
            let username = req.body.username;
            console.log(username);
            var sql = "UPDATE user set nickname = \"" + nickname + "\" WHERE username = \"" + username + "\""; 
            var query = db.query(sql,
                function(err, rows) {
                    if (err){
                        res.json({
                            success: false,
                            msg: 'User does not exist.'
                        })
                    } else {
                        res.json({
                            success: true,
                            msg: 'Nickname Successfully Updated',
                            nickname: nickname
                        })
                    }
                });
            
        });
    }


    changeProfilePicture(app, db) {
        app.post('/changeProfilePicture', (req, res) => {
            let profilePicture = req.body.profilePicture;
            let username = req.body.username;
            var sql = "UPDATE user set profilePicture = \"" + profilePicture + "\" WHERE username = \"" + username + "\""; 
            var query = db.query(sql,
                function(err, rows) {
                    if (err){
                        res.json({
                            success: false,
                            msg: 'User does not exist.'
                        })
                    } else {
                        res.json({
                            success: true,
                            msg: 'Profile Picture Successfully Updated',
                            profilePicture: profilePicture
                        })
                    }
                });
            
        });
    }
    submitCode(app, db) {
        app.post('/submitCode', (req, res) => {
            let email = req.body.email;
            let FACODE = req.body.forgotCode;
            let password = req.body.password;
            let phone = req.body.phone;
            var cols;
            
            if (email == '') {
                var cols = [phone];
                var sql = 'SELECT * FROM user WHERE phone = ? LIMIT 1';
            } else {
                var cols = [email];
                var sql = 'SELECT * FROM user WHERE email = ? LIMIT 1'
            }
            db.query(sql, 
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
                    if (FACODE == data[0].FACODE) {
                        password = bcrypt.hashSync(password, 9);
                        if (email == '') {
                            var sql = "UPDATE user set password = \"" + password + "\" WHERE phone = \"" + phone + "\"";
                        } else {
                            var sql = "UPDATE user set password = \"" + password + "\" WHERE email = \"" + email + "\"";
                        }
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
                    let phone = data[0].phone;
                    const accountSid = "AC7a6d07b8f2f5d7667b5bdb54180b8f3b";
                    const authToken = "652c8fd265ce89575e34c40446dd4ada";
                    const client = require('twilio')(accountSid, authToken);
                    if (phone != '') {
                        client.messages
                            .create({
                            body: 'Hello ' + username + ', we have noticed your attempt to reset your password. Please enter this code when prompted : ' + FACODE,
                            from: '+17088016706',
                            to: '+1' + phone
                            })
                    .then(message => console.log(message.sid));
                    var sql = "UPDATE user set FACODE = \"" + FACODE + "\" WHERE phone = \"" + phone + "\"";
                    var query = db.query(sql,
                    function(err, rows) {
                        if (err){
                            console.log(err);
                            console.log("Error in DB for updating 2FA Code for SMS");
                        } else {
                            console.log("Hello");
                        }
                    });
                    }
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
            let phone = req.body.phone;
            const accountSid = "AC7a6d07b8f2f5d7667b5bdb54180b8f3b";
            const authToken = "652c8fd265ce89575e34c40446dd4ada";
            const client = require('twilio')(accountSid, authToken);
            if (phone != '') {
                client.messages
                    .create({
                        body: 'Hello ' + username + ', we have noticed your attempt to reset your password. Please enter this code when prompted : ' + FACODE,
                        from: '+17088016706',
                        to: '+1' + phone
                    })
                    .then(message => console.log(message.sid));
                    var sql = "UPDATE user set FACODE = \"" + FACODE + "\" WHERE phone = \"" + phone + "\"";
                    var query = db.query(sql,
                    function(err, rows) {
                        if (err){
                            console.log(err);
                            console.log("Error in DB for updating 2FA Code for SMS");
                        } else {
                            console.log("Hello");
                        }
                    });
            }
        
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
                let phone = req.body.phone;
                let dev = 0;
                let enableFA = req.body.enableFA;
                let FACODE = "Unset";
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
                    , nickname:nickname, username:username, phone:phone, dev:dev, FACODE:FACODE, enableFA:enableFA}
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
                                console.log("HERE IS THE CLIENT FA - " + FACODE);
                                console.log("HERE IS THE DB FA - " + data[0].FACODE);
                                if (FACODE == data[0].FACODE) {
                                    req.session.userID = data[0].id;
                                    res.json({
                                        success: true,
                                        username: data[0].username,
                                        email : data[0].email,
                                        dev: data[0].dev,
                                        profilePicture: data[0].profilePicture
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
                                    email : data[0].email,
                                    dev: data[0].dev,
                                    profilePicture: data[0].profilePicture
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
                            username: data[0].username,
                            profilePicture: data[0].profilePicture,
                            dev: data[0].dev,
                            nickname: data[0].nickname
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

    // Function for making string SQL nice!
    mysql_real_escape_string (str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
                default:
                    return char;
            }
        });
    }


    // ROUTE SENDING QUERIES
    sendRoute(app, db) {
        app.post('/sendRoute', (req, res) => {
            let response = req.body.response;
            let responseString = this.mysql_real_escape_string(JSON.stringify(response))
            let username = req.body.username;
            let distance = req.body.distance;
            let pace = req.body.pace;
            let time = req.body.time;
            let calories = req.body.calories;
            let difficulty = req.body.difficulty;
            let rating = req.body.rating;
            let location = req.body.location;
            let date = req.body.date;
        
            var sql = "INSERT INTO prevroutes (`routeID`, `response`, `username`, `distance`, `pace`, `time`, `calories`, `difficulty`, `rating`, `location`, `date`) VALUES (NULL, \"" + responseString + "\", \"" + username + "\", \"" + parseFloat(distance) + "\", \"" + parseFloat(pace) + "\", \"" + parseFloat(time) + "\", \"" + parseInt(calories) + "\", \"" + parseInt(difficulty) + "\", \"" + parseInt(rating) + "\", \"" + location + "\", \"" + date + "\")";
            var query = db.query(sql,
            function(err, rows) {
                if (err) {
                    console.log("Error in DB for inserting");
                    res.json({
                        success: false,
                        msg: 'Insert could not be completed.'
                    })
                } else {
                    res.json({
                        success: true,
                        msg: 'Successfully inserted route.',
                    })
                }
            });
        });
    }

    getRouteID(app, db) {
        app.post('/getRouteID', (req, res) => {
    
            var sql = "SELECT routeID FROM prevroutes WHERE routeID = @@Identity;";
            var query = db.query(sql,
            function(err, rows) {
                if (err){
                    console.log("Error in DB for selecting last id.");
                    res.json({
                        success: false,
                        msg: 'Last id could not be selected.'
                    })
                } else {
                    res.json({
                        success: true,
                        routeID: rows[0].routeID,
                        msg: 'Successfully selected last id.',
                    })
                }
            });
        });
    }

    updateRating(app, db) {
        app.post('/updateRating', (req, res) => {
            let username = req.body.username;
            let routeID = req.body.routeID;
            let rating = req.body.rating;
        
            var sql = "UPDATE prevroutes SET rating = '" + parseInt(rating) + "' WHERE username = \"" + username + "\" AND prevroutes.routeID = " + parseInt(routeID);
            var query = db.query(sql,
            function(err, rows) {
                if (err){
                    console.log("Error in DB for updating");
                    res.json({
                        success: false,
                        msg: 'Update could not be completed.'
                    })
                } else {
                    res.json({
                        success: true,
                        msg: 'Successfully updated rating.',
                    })
                }
            });
        });
    }

    getResponse(app, db) {
        app.post('/getResponse', (req, res) => {
            var sql = "SELECT response FROM prevroutes WHERE routeID = @@Identity;";
            var query = db.query(sql,
            function(err, rows) {
                if (err){
                    console.log("Error in DB for selecting response form last route.");
                    res.json({
                        success: false,
                        msg: 'Last response could not be selected.'
                    })
                } else {
                    res.json({
                        success: true,
                        response: rows[0].response,
                        msg: 'Successfully selected last response.',
                    })
                }
            });
        });
    }


    // STATISTICS PAGE QUERIES
    getCompare(app, db) {
        app.post('/getCompare', (req, res) => {
            let dist = req.body.dist;
            let username = req.body.username;
        
            var sql = "SELECT distance, time FROM prevroutes WHERE username = \"" + username + "\" AND distance BETWEEN \"" + (parseFloat(dist) - parseFloat(dist * 0.1)) + "\" AND \"" + (parseFloat(dist) + parseFloat(dist * 0.1)) + "\" ORDER BY time LIMIT 1";
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
            let username = req.body.username;
        
            var sql = "SELECT sum(calories) as calories, date FROM prevroutes WHERE username = \"" + username + "\" GROUP BY date";
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
            let username = req.body.username;
        
            var sql = "SELECT distance, time, calories, date FROM prevroutes WHERE username = \"" + username + "\" ORDER BY date";
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