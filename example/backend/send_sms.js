const accountSid = "AC7a6d07b8f2f5d7667b5bdb54180b8f3b";
const authToken = "652c8fd265ce89575e34c40446dd4ada";
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+17088016706',
     to: '+18123279128'
   })
  .then(message => console.log(message.sid));