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

const getDataFromSunAPI = async function(lat,long){

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

                const response = {status : 'failed','message': 'Location not found'}
                res.writeHead(404,{'Content-Type':'application/json'})
                res.write(JSON.stringify(response));
                res.end();
            }
            else{
                lookupLocation = suggestionOnLocations['features'][0];
                lat = lookupLocation['geometry']['coordinates'][1];
                long = lookupLocation['geometry']['coordinates'][0];
                const currentWeatherConditions = await getDataFromWeatherAPI(lat,long);
                condition = currentWeatherConditions['current']['text']
                temperatureCelsius = currentWeatherConditions['current']['temp_c'];
                windKph = currentWeatherConditions['current']['wind_kph'];
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