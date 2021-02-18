const http = require('http');
const fs = require('fs');
const service = require('./service.js')

module.exports = http.createServer((req,res)=>{
    const baseUrl = 'http://'+req.headers.host + '/'
    const service = require('./service.js');
    const requestUrl = new URL(req.url,baseUrl);

    if(requestUrl.pathname == '/client' && req.method == 'GET') {
        console.log('Client ROUTE');
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
        console.log('Client CSS ROUTE');
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
        console.log('Client JS ROUTE');
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
        console.log('API POST LOCATION ROUTE');
        service.searchForMetadata(req,res);
    }
    if(requestUrl.pathname == '/metrics' && req.method == 'GET'){
        console.log('API GET METRICS ROUTE');
        service.getMetricsForApp(req,res);
    }

})