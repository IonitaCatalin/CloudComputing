const axios = require('axios');
const {Log,Response,User,Category} = require('./models')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const getDataFromMapboxAPI = async function(location){
    return axios({
        method: "get",
        url: `${process.env.MAPBOX_GEOCODING}/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.MAPBOX_KEY_API}`,
      }).then(res => res.data);
}
const getDataFromWeatherAPI = async function(lat,long){
    return axios({
        method: "get",
        url: `${process.env.WEATHER}/v1/current.json?key=${process.env.WEATHER_KEY_API}&q=${lat},${long}`,
      }).then(res => res.data);
}

const getDataFromSunAPI = async function(lat,long,date){
    return axios({
        method: "get",
        url: `${process.env.SUNRISE_SUNSET}/json?lat=${lat}&lng=${long}&date=${date}`,
      }).then(res => res.data);
}

const getDataFromTimeAPI = async function(lat,long){
    return axios({
        method: "get",
        url: `${process.env.IPGEOLOCATION}/timezone?apiKey=${process.env.IPGEOLOCATION_KEY_API}&lat=${lat}&long=${long}`,
      }).then(res => res.data);
}


const getMetricsForApp = async function(req,res){
    try{
        const dbLogs = await Log.find().populate("response")
        var sumOfLatencies = 0;
        var biggestLatency = 0;
        var getRequests = 0;
        var postRequests = 0;
        dbLogs.forEach(element=>{
            if(element['latency']>biggestLatency)
                biggestLatency = element['latency'];
            if(element['method'] == 'GET')
                getRequests+=1;
            if(element['method'] == 'POST')
                postRequests+=1;
            sumOfLatencies += element['latency'];
        });
        res.writeHead(200,{'Content-Type':'application/json'});
        const response = JSON.stringify({
            averageLatency:sumOfLatencies/dbLogs.length,
            biggestLatency:biggestLatency,
            getRequestsCount:getRequests,
            postRequestsCount:postRequests,
            lastRequest:dbLogs[dbLogs.length-1]
        });
        res.body = response;
        res.write(response);
        res.end();


    }catch(err){
            console.log(err);
            const response = JSON.stringify({status : 'failed','message': 'Internat server problem'});
            res.writeHead(500,{'Content-Type':'application/json'})
            res.write(response);
            res.body = response;
            res.end();
    }
}

const getAPIServicesStatus = async function(res)
{
    var mapBoxUp = false;
    var mapBoxLatency = 0;
    var openWeatherUp = false;
    var openWeatherLatency = 0;
    var ipgeolocationUp = false
    var ipgeolocationLatency = 0;
    var sunriseUp = false;
    var sunriseLatency = 0;
    try{
        var start = Date.now()
        const mapBoxRequest = await axios.get(process.env.MAPBOX_GEOCODING)
        if(mapBoxRequest.status == 200  || mapBoxRequest.status == 302){
            mapBoxUp = true;
            mapBoxLatency = Date.now() - start;
        }
        start = Date.now();
        const openWeatherRequest = await axios.get(process.env.WEATHER);
        if(openWeatherRequest.status == 200 || openWeatherRequest.status == 302){
            openWeatherUp = true;
            openWeatherLatency = Date.now() - start;
        }
        start = Date.now();
        const ipgeolocationRequest = await axios.get(process.env.IPGEOLOCATION);
        if(ipgeolocationRequest.status == 200 || ipgeolocationRequest.status == 302){
            ipgeolocationUp = true;
            ipgeolocationLatency = Date.now() - start;
        }
        start = Date.now();
        const sunriseRequest = await axios.get(process.env.SUNRISE_SUNSET)
        if(sunriseRequest.status == 200 || sunriseRequest.status == 302){
            sunriseUp = true;
            sunriseLatency = Date.now() - start;
        }
        const response = JSON.stringify(
                        {
                            mapBoxRunning:mapBoxUp,
                            mapBoxLatency:mapBoxLatency,
                            openWeatherRunning:openWeatherUp,
                            openWeatherLatency:openWeatherLatency,
                            ipgeolocationRunning:ipgeolocationUp,
                            ipgeolocationLatency:ipgeolocationLatency,
                            sunriseSunsetRunning:sunriseUp,
                            sunriseSunsetLatency:sunriseLatency
                        });
        res.writeHead(200,{'Content-Type':'application/json'})
        res.write(response);
        res.body = response;
        res.end();

    }catch(err){
        console.log(err);
        const response = JSON.stringify({status : 'failed',message: "Internat server problem"});
        res.writeHead(500,{'Content-Type':'application/json'})
        res.write(response);
        res.body = response;
        res.end();
    }
}

const registerNewUser = async function(req,res){
    var requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end',async ()=>{
        try{
            bodyJSON = JSON.parse(requestBody);
        }catch(err){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Malformed JSON's body"}));
        }
        if(bodyJSON['username'] === undefined || bodyJSON['email'] === undefined || bodyJSON['password'] === undefined){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Missing required fields(ex:username,password,email)"}));
        } 
        const usrnmConfl = await User.exists({username:bodyJSON['username']});
        const emailConfl = await User.exists({email:bodyJSON['email']});
        if(usrnmConfl || emailConfl){
            res.writeHead(409,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"There is another user with the specified fields(username,email)"}));
        }
        else{
            try{
                const user = new User({
                    uuid:uuidv4(),
                    username:bodyJSON['username'],
                    email:bodyJSON['email'],
                    password:bodyJSON['password'],
                    categories:[{name:"Default",locations:[]}]
                })
                const createdUser = await User.create(user);
                
                res.writeHead(201,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"success",message:"User created successfully"}));

            }catch(err){
                console.log(err)
                res.writeHead(500,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Something went wrong"}));
            }
        }
        
    })
}

const logInUser = async function(req,res){
    var requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end',async ()=>{
        try{
            bodyJSON = JSON.parse(requestBody);
        }catch(err){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Malformed JSON's body"}));
        }
        if(bodyJSON['username'] === undefined || bodyJSON['password'] === undefined){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Missing required fields(ex:username,password)"}));
        } 
        const loggedUser = await User.find({username:bodyJSON['username'],password:bodyJSON['password']});
        var clientToken = '';
        if(loggedUser.length === 1){
            try{
                console.log(loggedUser[0]['uuid']);
                clientToken = jwt.sign({id:loggedUser[0]['uuid']},process.env.SECRET_KEY,{expiresIn:86400});

            }catch(err){
                res.writeHead(500,{'Content-Type:':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Internal problems generating tokens"}));
            }
            res.writeHead(500,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"success",content:{token:clientToken},message:"Logged in successfully"}));
        }
        else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"User not found"}));
        }
    })

}

const fetchUserProfile = async function(res,id){
    const loggedUser = await User.find({uuid:id}).populate('category');
    const user = loggedUser[0];
    if(loggedUser.length === 0){
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }else{
        res.writeHead(200,{'Content-Type':'application/json'})
        console.log(user);
        res.end(JSON.stringify({status:"success",content:
            {
                username:user['username'],
                email:user['email'],
                password:user['password'],
                categories:user['categories']
            },
        message:"User found successfully"}));
    }
}
const deleteUserProfile = async function(res,id){
    const existsUser = await User.exists({uuid:id});
    if(!existsUser){
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }else{
        try{
            const deletedUser = await User.deleteOne({uuid:id});
            res.writeHead(202,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"User deleted successfully"}));

        }catch(err){
            res.writeHead(500,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Something went wrong"}));
        }
    }
}

const updateUserProfile = async function(req,res,id){
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end',async ()=>{
        try{
            bodyJSON = JSON.parse(requestBody);
        }catch(err){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Malformed JSON's body"}));
        }
        let newUsr = '';
        let newEmail = '';
        let newPass = '';

        const users = await User.find({uuid:id});
        if(users.length == 0){
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"User not found"}));
        }else{
            const user = users[0];
            if(bodyJSON['username'] === undefined && bodyJSON['password'] === undefined && bodyJSON['email'] === undefined){
                res.writeHead(400,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Nothing to modify"}));
            }else{
                if(bodyJSON['username'] !== undefined){
                    const existsUsername = await User.exists({username:bodyJSON['username']})
                    if(!existsUsername){
                        newUsr = bodyJSON['username'];
                    }
                    else{
                        res.writeHead(409,{'Content-Type':'application/json'})
                        res.end(JSON.stringify({status:"failed",message:"Username is already taken"}));
                    }
                }
                else{
                    newUsr = user['username']
                }

                if(bodyJSON['email'] !== undefined){
                    const existsEmail = await User.exists({email:bodyJSON['email']})
                    if(!existsEmail){
                        newEmail = bodyJSON['email'];
                    }
                    else{
                        res.writeHead(409,{'Content-Type':'application/json'})
                        res.end(JSON.stringify({status:"failed",message:"Email is already taken"}));
                    }
                }
                else{
                    newEmail = user['email']
                }

                if(bodyJSON['password'] !== undefined){
                    newPass = bodyJSON['password'];
                }
                else{
                    newPass = user['password']
                }
                
                try{
                    const modifiedUser = await User.updateOne({uuid:id},
                        {$set:{
                           'username':newUsr,
                           'email':newEmail,
                           'password':newPass 
                        }})
                    res.writeHead(200,{'Content-Type':'application/json'})
                    res.end(JSON.stringify({status:"success",message:"User data modified successfully"}));
                }catch(err){
                    res.writeHead(500,{'Content-Type':'application/json'})
                    res.end(JSON.stringify({status:"failed",message:"Nothing to modify"}));
                }
            }
        }
    });
}

const createCategory = function(req,res,id){
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end',async ()=>{
        try{
            bodyJSON = JSON.parse(requestBody);
        }catch(err){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Malformed JSON's body"}));
        }
        if(bodyJSON['name'] !== undefined){
            const existsUser = await User.exists({uuid:id})
            if(existsUser){
                const itsCategories = await User.findOne({uuid:id},{categories:1});
                if(!itsCategories['categories'].find(element => element['name'] == bodyJSON['name'])){
                    try{
                        const newLoc = {locations:[],name:bodyJSON['name']};
                        await User.findOneAndUpdate({uuid:id},{$push:{categories:newLoc}})
                    }
                    catch(err){
                        res.writeHead(500,{'Content-Type':'application/json'})
                        res.end(JSON.stringify({status:"failed",message:"Something went wrong"}));
                    }
                    res.writeHead(201,{'Content-Type':'application/json'})
                    res.end(JSON.stringify({status:"success",message:"Category added successfully"}));
                }else{
                    res.writeHead(409,{'Content-Type':'application/json'})
                    res.end(JSON.stringify({status:"failed",message:"Category name already taken"}));
                }
            }else{
                res.writeHead(404,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"User not found"}));
            }
        }else{
            res.writeHead(200,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Name parameter is required"}));
        }
    });
}   

const getCategories = async function(res,id){
    const userExists = await User.exists({uuid:id})
    if(userExists){
        const user = await User.findOne({uuid:id});
        res.writeHead(200,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"success",content:{
            categories:user['categories']
        },message:"Categories retrieved successfully"}));
    }else{
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }
}

const deleteCategory = async function(res,id,name){
    const existsUser = await User.exists({uuid:id});
    if(existsUser){
        try{
            //await User.findOneAndUpdate({uuid:id},{$push:{categories:newLoc}})
            await User.findOneAndUpdate({uuid:id},{$pull:{categories:{name:name}}})
            res.writeHead(202,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"success",message:"Category deleted successfully"}));
        }catch(err){
            res.writeHead(500,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Something went wrong"}));
        }
    }else{
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }
}

const addLocationToCtg = function(req,res,id,ctg){
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end',async ()=>{
        try{
            bodyJSON = JSON.parse(requestBody);
        }catch(err){
            res.writeHead(400,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Malformed JSON's body"}));
        }
        const existsUser = await User.exists({uuid:id});
        if(existsUser){
            const existsCategory = await User.exists({uuid:id,'categories.name':ctg});
            const existsLocation = await User.exists({uuid:id,'categories.name':ctg,"categories.$.locations": bodyJSON['location']})
            console.log(existsLocation);
            if(existsCategory){
                if(!existsLocation){
                        try{
                            await User.findOneAndUpdate({uuid:id,'categories.name':ctg},{$push:{"categories.$.locations": bodyJSON['location']}})
                            res.writeHead(200,{'Content-Type':'application/json'})
                            res.end(JSON.stringify({status:"success",message:"Location added to category successfully"}));
                        }catch(err){
                            console.log(err);
                            res.writeHead(500,{'Content-Type':'application/json'})
                            res.end(JSON.stringify({status:"failed",message:"Something went wrong"}));
                        }
                }else{
                    res.writeHead(409,{'Content-Type':'application/json'})
                    res.end(JSON.stringify({status:"failed",message:"Location already exists in the current category"}));
                }
            }else{
                res.writeHead(404,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Category not found"}));
            }
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"User not found"}));
        }
    });
}

const deleteLocationFromCtg = async function(res,id,ctg,locId){
    
    const existsUser = await User.exists({uuid:id});
    if(existsUser){
        const existsCategory = await User.exists({uuid:id,'categories.name':ctg});
        if(existsCategory){
            const preferences = await User.findOne({uuid:id,'categories.name':ctg},{'categories.$':1});
            if(preferences['categories'][0]['locations'].length >= locId){
                const value = preferences['categories'][0]['locations'][locId];
                await User.findOneAndUpdate({uuid:id,'categories.name':ctg},{$pull:{"categories.$.locations": value}})
                res.writeHead(202,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Location deleted successfully"}));
            }else{
                res.writeHead(404,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Location with the specified id not found in the specified category"}));
            }
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Category not found"}));
        }
    }
    else{
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }
}

const getDataForLoc = async function(res,id,ctg,locId){
    const existsUser = await User.exists({uuid:id});
    console.log(locId);
    if(existsUser){
        const existsCategory = await User.exists({uuid:id,'categories.name':ctg});
        if(existsCategory){
            const preferences = await User.findOne({uuid:id,'categories.name':ctg},{'categories.$':1});
            if(preferences['categories'][0]['locations'].length >= locId){
                const value = preferences['categories'][0]['locations'][locId];
                try{
                    const suggestionOnLocations = await getDataFromMapboxAPI(value);
                    if(suggestionOnLocations['features'].length == 0){
            
                        const response = JSON.stringify({status : 'failed','message': 'Location can not be found'})
                        res.writeHead(404,{'Content-Type':'application/json'})
                        res.end(response);
                    }
                    else{
                        const lookupLocation = suggestionOnLocations['features'][0];
                        const lat = lookupLocation['geometry']['coordinates'][1];
                        const long = lookupLocation['geometry']['coordinates'][0];
                        const currentWeatherConditions = await getDataFromWeatherAPI(lat,long);
                        const temporalCoordinates = await getDataFromTimeAPI(lat,long)
                        const date = temporalCoordinates['date'];
                        const solarPosition = await getDataFromSunAPI(lat,long,date)
                        
                        res.writeHead(200,{'Content-Type':'application/json'});
                        const response = JSON.stringify({status:'success',
                                    'content':
                                                {
                                                'latitude':lookupLocation['geometry']['coordinates'][1],
                                                'longitude':lookupLocation['geometry']['coordinates'][0],
                                                'temperatureCelsius':currentWeatherConditions['current']['temp_c'],
                                                'windKph':currentWeatherConditions['current']['wind_kph'],
                                                'date':temporalCoordinates['date'],
                                                'time':temporalCoordinates['time_24'],
                                                'dayLength':solarPosition['results']['day_length'],
                                            },
                                    'message':'Data retrieved successfully for the given location'});
                        res.end(response);
                    }
            
                }
                catch(err){
                    console.log(err);
                    const response = JSON.stringify({status : 'failed','message': 'Something went wrong'})
                    res.writeHead(500,{'Content-Type':'application/json'})
                    res.end(response);
                }
            }else{
                res.writeHead(404,{'Content-Type':'application/json'})
                res.end(JSON.stringify({status:"failed",message:"Location with the specified id not found in the specified category"}));
            }
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({status:"failed",message:"Category not found"}));
        }
    }else{
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({status:"failed",message:"User not found"}));
    }
}


module.exports = {
    getMetricsForApp,
    getAPIServicesStatus,
    registerNewUser,
    logInUser,
    fetchUserProfile,
    deleteUserProfile,
    updateUserProfile,
    createCategory,
    getCategories,
    deleteCategory,
    addLocationToCtg,
    deleteLocationFromCtg,
    getDataForLoc
}