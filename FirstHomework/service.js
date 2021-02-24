const axios = require('axios');
const {Log,Response} = require('./models')
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

const searchForMetadata = async function(req,res){
    var requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end', async () => {
        if(requestBody == ''){
            const response = {status : 'failed','message': 'JSON required in the body missing'}
            res.writeHead(400,{'Content-Type':'application/json'})
            res.body = response;
            res.write(JSON.stringify(response));
            res.end();
        }
        result = JSON.parse(requestBody);
        try{
            const suggestionOnLocations = await getDataFromMapboxAPI(result['location']);
            if(suggestionOnLocations['features'].length == 0){

                const response = {status : 'failed','message': 'Location not found anywhere'}
                res.writeHead(404,{'Content-Type':'application/json'})
                res.body = response;
                res.write(JSON.stringify(response));
                res.end();
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
                                      'name':result['location'],
                                      'latitude':lookupLocation['geometry']['coordinates'][1],
                                      'longitude':lookupLocation['geometry']['coordinates'][0],
                                      'temperatureCelsius':currentWeatherConditions['current']['temp_c'],
                                      'windKph':currentWeatherConditions['current']['wind_kph'],
                                      'date':temporalCoordinates['date'],
                                      'time':temporalCoordinates['time_24'],
                                      'dayLength':solarPosition['results']['day_length'],
                                    },
                            'message':'Data retrieved succesfully for the given location'});
                res.body = response;
                res.write(response);
                res.end();
            }

        }
        catch(err){
            const response = JSON.stringify({status : 'failed','message': 'Internat server problem'})
            res.writeHead(500,{'Content-Type':'application/json'})
            res.write(response);
            res.body = response;
            res.end();
        }
    });
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
        const response = JSON.stringify({status : 'failed','message': 'Internat server problem'});
        res.writeHead(500,{'Content-Type':'application/json'})
        res.write(response);
        res.body = response;
        res.end();
    }
}

module.exports = {
    searchForMetadata,
    getMetricsForApp,
    getAPIServicesStatus
}