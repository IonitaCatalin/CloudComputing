const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{type:String,required:true},
    locations:[{type:String}]
})

const Category = mongoose.model('category',categorySchema);

module.exports = Category; 