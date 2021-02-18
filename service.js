const axios = require('axios');
require('dotenv').config()

const getDataFromMapboxAPI = async function(location){
    return axios({
        method: "get",
        url: `${process.env.MAPBOX_GEOCODING}/${location}.json?access_token=${process.env.MAPBOX_KEY_API}`,
      }).then(res => res.data);
}
const getDataFromWeatherAPI = async function(lat,long){
    return axios({
        method: "get",
        url: `${process.env.WEATHER}/current.json?key=${process.env.WEATHER_KEY_API}&q=${lat},${long}`,
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
        url: `${process.env.IPGEOLOCATION}?apiKey=${process.env.IPGEOLOCATION_KEY_API}&lat=${lat}&long=${long}`,
      }).then(res => res.data);
}

const searchForMetadata = async function(req,res){
    var requestBody = '';
    var location = '';
    req.on('data', chunk => {
        requestBody += chunk.toString(); 
    });
    req.on('end', async () => {
        result = JSON.parse(requestBody);
        try{
            const suggestionOnLocations = await getDataFromMapboxAPI(result['location']);
            if(suggestionOnLocations['features'].length == 0){

                const response = {status : 'failed','message': 'Location not found anywhere'}
                res.writeHead(404,{'Content-Type':'application/json'})
                res.write(JSON.stringify(response));
                res.end();
            }
            else{
                lookupLocation = suggestionOnLocations['features'][0];
                lat = lookupLocation['geometry']['coordinates'][1];
                long = lookupLocation['geometry']['coordinates'][0];
                const currentWeatherConditions = await getDataFromWeatherAPI(lat,long);
                const temporalCoordinates = await getDataFromTimeAPI(lat,long)
                var temperatureCelsius = currentWeatherConditions['current']['temp_c'];
                var windKph = currentWeatherConditions['current']['wind_kph'];
                var date = temporalCoordinates['date'];
                var time = temporalCoordinates['time_24'];
                const solarPosition = await getDataFromSunAPI(lat,long,date)
                var dayLength = solarPosition['results']['day_length'];
                
                res.writeHead(200,{'Content-Type':'application/json'});
                const response = {status:'success',
                            'content':
                                     {
                                      'name':result['location'],
                                      'latitude':lat,
                                      'longitude':long,
                                      'temperatureCelsius':temperatureCelsius,
                                      'windKph':windKph,
                                      'date':date,
                                      'time':time,
                                      'dayLength':dayLength
                                    },
                            'message':'Data retrieved succesfully for the given location'};
                res.write(JSON.stringify(response));
                res.end();
            }

        }
        catch(err){
            console.log(err);
            const response = {status : 'failed','message': 'Internat server problem'}
            res.writeHead(500,{'Content-Type':'application/json'})
            res.write(JSON.stringify(response));
            res.end();
        }
        
    });
}

const getMetricsForApp = function(req,res){

}

module.exports = {
    searchForMetadata,
    getMetricsForApp
}