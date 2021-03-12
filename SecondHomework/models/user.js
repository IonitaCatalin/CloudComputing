const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uuid:{required:true,type:String},
    username:{required:true,type:String},
    email:{required:true,type:String},
    password:{required:true,type:String},
    categories:[{name:String,locations:Array}]

})

const User = mongoose.model('user',userSchema);

module.exports = User;