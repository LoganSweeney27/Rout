const bcrypt = require('bcrypt');

let pswrd = bcrypt.hashSync('42069', 9);
console.log(pswrd)