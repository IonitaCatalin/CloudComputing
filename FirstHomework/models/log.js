const mongoose = require('mongoose');


const logSchema = new mongoose.Schema({
    timestamp:{required:true,type:Date},
    httpVersion:{required:true,type:String},
    method:{required:true,type:String},
    latency:{required:true,type:Number},
    requestBody:{required:false,type:String},
    remoteAddress:{required:true,type:String},
    remoteFamily:{required:true,type:String},
    url:{required:true,type:String},
    response:{required:true,type:mongoose.Schema.Types.ObjectId,ref:"response"}
    
})

const Log = mongoose.model('log',logSchema);

module.exports = Log; 