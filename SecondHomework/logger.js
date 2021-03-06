const {Log,Response} = require('./models')
require('dotenv').config()

const logOnRequest = async function(req,res){
    var requestBodyData = '';
    const requestReceivedAt = Date.now();

    req.on('data', chunk => {
        requestBodyData += chunk;
    })
    
    res.on('finish',async ()=>{
        const { httpVersion, method, socket, url } = req;
        const { remoteAddress, remoteFamily } = socket;
        const { statusCode, statusMessage } =res;
        const requestLog = JSON.stringify({
              timestamp: Date.now(),
              httpVersion,
              method,
              latency:Date.now()-requestReceivedAt,
              requestBody:requestBodyData,
              responseBody:res.body,
              remoteAddress,
              remoteFamily,
              url,
              response:{
                  statusCode,
                  statusMessage,
              }
            });
        console.log(requestLog);
        const asPerResponseParam = new Response({
                                    statusCode:statusCode,
                                    statusMessage:statusMessage
                                });
        const createdRespParam = await Response.create(asPerResponseParam);
       try{
            const log = new Log({
                timestamp:Date.now(),
                httpVersion:httpVersion,
                method:method,
                latency:Date.now()-requestReceivedAt,
                requestBody:requestBodyData,
                responseBody:res.body,
                remoteAddress:remoteAddress,
                remoteFamily:remoteFamily,
                url:url,
                response:createdRespParam
            })
            const createdLog = await Log.create(log);
        }catch(err){
            console.log(err);
        }

    })
}

module.exports = {
    logOnRequest
}