const http = require('http');
const fs = require('fs');
const logger  = require('./logger.js');
const service = require('./service.js')

module.exports = http.createServer((req,res)=>{
    const baseUrl = 'http://'+req.headers.host + '/'
    const service = require('./service.js');
    const requestUrl = new URL(req.url,baseUrl);
    logger.logOnRequest(req,res);

    if(requestUrl.pathname == '/client' && req.method == 'GET') {
        fs.readFile('./client/index.html',function(err,html){
            if(err){
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write('File not found on the server')
                res.end();
            }


            res.writeHeader(200,{"Content-Type":"text/html"});
            res.write(html)
            res.end()

        })
    }
    if(requestUrl.pathname == '/css/style.css' && req.method == 'GET'){
        fs.readFile('./client/css/style.css',function(err,css){
            if(err){
                res.writeHead(404, { 'Content-Type': 'text/css' });
                res.write('File not found on the server')
                res.end();
            }

            res.writeHeader(200,{"Content-Type":"text/css"});
            res.write(css)
            res.end()

        })
    }   
    if(requestUrl.pathname == '/js/submit.js' && req.method == 'GET'){
        fs.readFile('./client/js/submit.js',function(err,js){
            if(err){
                res.writeHead(404, { 'Content-Type': 'text/javascript' });
                res.write('File not found on the server')
                res.end();
            }

            res.writeHeader(200,{"Content-Type":"text/javascript"});
            res.write(js)
            res.end()

        })
    }   
    if(requestUrl.pathname == '/api' && req.method == 'POST'){
        service.searchForMetadata(req,res);
    }
    if(requestUrl.pathname == '/metrics' && req.method == 'GET'){
        service.getMetricsForApp(req,res);
    }

})