const nodemailer = require("nodemailer");

const mailer = {
    sendResetEmail: function(email, code) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 465,
            auth: {
                user: 'noreply.rout.link@gmail.com',
                pass: 'BKRpJG2D6w57KBMb6hkP4iM3'
            }
        });
        
        const mailOptions = {
            to: email,
            from: 'noreply.rout.link@gmail.com',
            subject: 'Rout Password Reset',
            text:
                'Hello, we have noticed your attempt to reset your password. Please enter this code when prompted : ' + code
                
        }
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.error("Unable to send password reset email");
            }
        });
    }
};

module.exports = mailer;