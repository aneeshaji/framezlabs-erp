const bcrypt = require('bcrypt');

const password = 'password123'; // Temporary password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('New Password Hash for "password123":');
    console.log(hash);
});
