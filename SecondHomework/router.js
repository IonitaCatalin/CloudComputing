const http = require('http');
const fs = require('fs');
const logger  = require('./logger.js');
const service = require('./service.js');

const checkMIMEType = async function(req,res,type,callback){
    const contentType = req.headers['content-type'];
    if(contentType === type){
        callback();        
    }
    else{
        res.writeHead(415, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({status:"failed",message:"Only json format accepted"}));
        res.end();
    }
    
}   


module.exports = http.createServer((req,res)=>{
    const baseUrl = 'http://'+req.headers.host + '/'
    const requestUrl = new URL(req.url,baseUrl);
    
    //logger.logOnRequest(req,res);

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
    if(requestUrl.pathname == '/client/login' && req.method == 'GET') {
        fs.readFile('./client/login.html',function(err,html){
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

    if(requestUrl.pathname == '/client/register' && req.method == 'GET') {
        fs.readFile('./client/register.html',function(err,html){
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

    if(requestUrl.pathname == '/client/css/register.css' && req.method == 'GET'){
        fs.readFile('./client/css/register.css',function(err,css){
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
    

    if(requestUrl.pathname == '/client/css/login.css' && req.method == 'GET'){
        fs.readFile('./client/css/login.css',function(err,css){
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
    if(requestUrl.pathname == '/js/worker.js' && req.method == 'GET'){
        fs.readFile('./client/js/worker.js',function(err,js){
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
        checkMIMEType(req,res,'application/json',()=>{
            service.searchForLocation(req,res);
        })
        
    }
    if(requestUrl.pathname == '/monitor' && req.method == 'GET'){
        checkMIMEType(req,res,'application/json',()=>{
            service.getAPIServicesStatus(res);
        })
        
    }
    if(requestUrl.pathname == '/metrics' && req.method == 'GET'){
        checkMIMEType(req,res,'application/json',()=>{
            service.getMetricsForApp(req,res);
        })
        
    }
    if(requestUrl.pathname == '/api/register' && req.method == 'POST'){
        checkMIMEType(req,res,'application/json',async ()=>{
            service.registerNewUser(req,res);
        })
    }

})