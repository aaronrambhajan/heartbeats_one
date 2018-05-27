const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {type: String,
               unique: true,
               required: true,
               trim: true},
    email: {type: String,
            unique: true,
            required: true,
            trim: true},
    password: {type: String,
               required: true},
    passwordConf: {type: String,
                   required: true}
});



let User = mongoose.model('User', userSchema);
module.exports = User;
