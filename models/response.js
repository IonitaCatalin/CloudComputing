const {Schema,model} = require('mongoose');

const responseSchema = new Schema({
    statusCode:{required:true,type:Number},
    statusMessage:{required:true,type:String}
});

const Response = model('response',responseSchema);

module.exports = Response
