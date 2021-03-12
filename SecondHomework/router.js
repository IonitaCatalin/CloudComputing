const http = require('http');
const fs = require('fs');
const logger  = require('./logger.js');
const service = require('./service.js');
const jwt = require('jsonwebtoken');
const mm = require('micromatch');

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

const verifyJWT = async function(req,res,callback){
    if(req.headers['authorization'] === undefined){
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({status:"failed",message:"Missing authorization header"}));
    }
    else{
        try{
            const payload = jwt.verify(String(req.headers['authorization']).split(" ")[1],process.env.SECRET_KEY);
            callback(payload);
        }catch(err){
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({status:"failed",message:"Unauthorized access"}));
        }

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
    else if(requestUrl.pathname == '/client/login' && req.method == 'GET') {
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

    else if(requestUrl.pathname == '/client/register' && req.method == 'GET') {
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

    else if(requestUrl.pathname == '/client/css/register.css' && req.method == 'GET'){
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
    

    else if(requestUrl.pathname == '/client/css/login.css' && req.method == 'GET'){
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
    
    else if(requestUrl.pathname == '/css/style.css' && req.method == 'GET'){
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

    else if(requestUrl.pathname == '/js/submit.js' && req.method == 'GET'){
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
    else if(requestUrl.pathname == '/js/worker.js' && req.method == 'GET'){
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
    else if(requestUrl.pathname == '/api' && req.method == 'POST'){
        checkMIMEType(req,res,'application/json',()=>{
            service.searchForLocation(req,res);
        })
        
    }
    else if(requestUrl.pathname == '/monitor' && req.method == 'GET'){
        checkMIMEType(req,res,'application/json',()=>{
            service.getAPIServicesStatus(res);
        })
        
    }
    else if(requestUrl.pathname == '/metrics' && req.method == 'GET'){
        checkMIMEType(req,res,'application/json',()=>{
            service.getMetricsForApp(req,res);
        })
        
    }
    else if(requestUrl.pathname == '/api/register' && req.method == 'POST'){
        checkMIMEType(req,res,'application/json',async ()=>{
            service.registerNewUser(req,res);
        })
    }
    else if(requestUrl.pathname == '/api/login' && req.method == 'POST'){
        checkMIMEType(req,res,'application/json',async ()=>{
            service.logInUser(req,res);
        })
    }
    else if(requestUrl.pathname == '/api/users' && req.method == 'GET'){
        verifyJWT(req,res,async (payload)=>{
            service.fetchUserProfile(res,payload['id']);
        })
    }
    else if(requestUrl.pathname == '/api/users' && req.method == 'DELETE'){
        verifyJWT(req,res,async (payload)=>{
            service.deleteUserProfile(res,payload['id']);
        })
    }
    else if(requestUrl.pathname === '/api/users' && req.method == 'PATCH'){
        verifyJWT(req,res,async (payload)=>{
            checkMIMEType(req,res,'application/json',async ()=>{
                service.updateUserProfile(req,res,payload['id']);
            });
        });
    }
    else if(mm.isMatch(requestUrl.pathname,'/api/categories') && req.method == "POST")
    {
        ctgName = requestUrl.pathname.split('/')[3];
        verifyJWT(req,res,async (payload)=>{
            checkMIMEType(req,res,'application/json',async ()=>{
                service.createCategory(req,res,payload['id'],ctgName)
            });
        });
    }
    else if(requestUrl.pathname === '/api/categories' && req.method == "POST")
    {
        verifyJWT(req,res,async (payload)=>{
            checkMIMEType(req,res,'application/json',async ()=>{
                service.createCategory(req,res,payload['id'])
            });
        });
    }
    else if(requestUrl.pathname === '/api/categories' && req.method == "GET")
    {
        verifyJWT(req,res,async (payload)=>{
            service.getCategories(res,payload['id'])
        });
    }
    else if(mm.isMatch(requestUrl.pathname,'/api/categories/*') && req.method == "DELETE")
    {
        ctgName = requestUrl.pathname.split('/')[3];
        verifyJWT(req,res,async (payload)=>{
            service.deleteCategory(res,payload['id'],ctgName)
        });
    }
    else if(mm.isMatch(requestUrl.pathname,'/api/categories/*/locations') && req.method == "PUT")
    {
        ctgName = requestUrl.pathname.split('/')[3];
        verifyJWT(req,res,async (payload)=>{
            checkMIMEType(req,res,'application/json',async ()=>{
                service.addLocationToCtg(req,res,payload['id'],ctgName)
            });
        });
    }
    else if(mm.isMatch(requestUrl.pathname,'/api/categories/*/locations/*') && req.method == "DELETE")
    {
        ctgName = requestUrl.pathname.split('/')[3];
        locId = requestUrl.pathname.split('/')[5];
        verifyJWT(req,res,async (payload)=>{
            service.deleteLocationFromCtg(res,payload['id'],ctgName,locId)
        });
    }
    else
    {
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"Unknown route"}));
    }

})