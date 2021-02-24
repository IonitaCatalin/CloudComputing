const domain = "http://localhost";
var searchBar = document.querySelector('.searchLocation');
var metricsButton = document.querySelector('.metricsButton');
var searchButton = document.querySelector('.searchButton');
var contentPanel = document.querySelector('.content');
var benchmarkButton = document.querySelector('.benchmarkButton');
var checkButton = document.querySelector('.checkButton');
var concurrentCallsRes;

const port = 3000;

function sendRequestTo(sendTo){
    console.log(`Starting sending request to ${sendTo}`);
    return fetch(sendTo,{
            headers:{
                'Accept':'application/json',
                'Content-Type': 'application/json'
            },
            method:"POST",
            body : JSON.stringify({'location':'Alaska'})
        });
}

async function sendNRequestBatchesTo(batchesCount,requests,endpoint)
{   
    const batches = Array(batchesCount).fill(Array(requests).fill(sendRequestTo(endpoint)))
    const sendAt = Date.now();
    for(batch in batches){
        await Promise.all(batches[batch]).then(results=>{
            console.log(results);
        })
    }
}

function getDataFromAPI(location)
{
    
    fetch(domain + ':' + port + '/api',{
        headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json'
        },
        method:"POST",
        body : JSON.stringify({'location':location})
    }).then(response => {
        if(response.ok){
            return response.json();
        }else{
            throw new Error(response.status);
        }
    }).then((responseJson) =>{
            var result = responseJson['content'];
            var location = document.createElement('p');
            var latitude = document.createElement('p');
            var longitude = document.createElement('p');
            var temperatureCelsius = document.createElement('p')
            var windKph = document.createElement('p');
            var date = document.createElement('p');
            var time = document.createElement('p');
            var dayLength = document.createElement('p');
            [location,latitude,longitude,temperatureCelsius,windKph,date,time,dayLength].forEach(async function(e){
                e.className = 'data';
                e.style = "color:green;margin-bottom:0px;font-weight:bold;"
            })
            
            location.textContent = 'Name:'+result['name'];
            latitude.textContent = 'Latitude:'+result['latitude'];
            longitude.textContent = 'Longitude:'+result['longitude'];
            temperatureCelsius.textContent = 'TemperatureCelsius:'+result['temperatureCelsius'];
            windKph.textContent = 'WindKph:'+result['windKph'];
            date.textContent = 'Date:'+result['date'];
            time.textContent = 'Time:'+result['time'];
            dayLength.textContent = 'DayLength:'+result['dayLength'];
            contentPanel.append(location,latitude,longitude,temperatureCelsius);
            contentPanel.append(windKph,date,time,dayLength);
    }).catch((error) => {
        var errorText = document.createElement('p');
        errorText.textContent = 'Given location cannot be found or something went wrong,errorcode:'+ error +"!";
        errorText.style = "color:red";
        errorText.className = "data"
        contentPanel.append(errorText);

    })
}

function getMetricsFromAPI(){
    fetch(domain + ':' + port + '/metrics',{
        headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json'
        },
        method:"GET",
    }).then(response => {
        if(response.ok){
            return response.json();
        }else{
            throw new Error(response.status);
        }
    }).then((responseJson) =>   {
        var averageLatency = document.createElement('p');
        var maxLatency = document.createElement('p');
        var getCount = document.createElement('p');
        var postCount = document.createElement('p');
        var lastRequestTimestamp = document.createElement('p');
        averageLatency.textContent = 'AverageLatency: '+responseJson['averageLatency'];
        maxLatency.textContent = 'MaxLatency: '+responseJson['biggestLatency'];
        getCount.textContent = 'GET-RequestCount: '+responseJson['getRequestsCount'];
        postCount.textContent = 'POST-RequestCount: '+responseJson['postRequestsCount'];
        lastRequestTimestamp.textContent = 'LastRequestTimestamp: ' + responseJson['lastRequest']['timestamp'];
        [averageLatency,maxLatency,getCount,postCount,lastRequestTimestamp].forEach(async function(e){
            e.className = 'data';
            e.style = "color:red;margin-bottom:0px;font-weight:bold;"
        })
        contentPanel.append(averageLatency,maxLatency);
        contentPanel.append(getCount,postCount,lastRequestTimestamp);


           
    }).catch((error) => {
        var errorText = document.createElement('p');
        errorText.textContent = 'Something went wrong when fetching metrics,errorcode:'+error+"!";
        errorText.style = "color:red";
        errorText.className = "data"
        contentPanel.append(errorText);

    })
}
function getMonitorFromAPI(){
    fetch(domain + ':' + port + '/monitor',{
        headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json'
        },
        method:"GET",
    }).then(response => {
        if(response.ok){
            return response.json();
        }else{
            throw new Error(response.status);
        }
    }).then((responseJson) =>{
        var mapBoxStatus = document.createElement('p');
        var mapBoxLatency = document.createElement('p');
        var openWeatherStatus = document.createElement('p');
        var openWeatherLatency = document.createElement('p');
        var ipgeolocationStatus = document.createElement('p');
        var ipgeolocationLatency = document.createElement('p');
        var sunriseStatus = document.createElement('p');
        var sunriseLatency = document.createElement('p');


        mapBoxStatus.textContent = 'MapBoxStatus: ' + responseJson['mapBoxRunning'];
        mapBoxLatency.textContent = 'MapBoxLatency: ' + responseJson['mapBoxLatency'];
        openWeatherStatus.textContent = 'OpenWeatherRunning: ' + responseJson['openWeatherRunning'];
        openWeatherLatency.textContent = 'OpenWeatherLatency: ' + responseJson['openWeatherLatency'];
        ipgeolocationStatus.textContent = 'IPGeolocationRunning: ' + responseJson['ipgeolocationRunning'];
        ipgeolocationLatency.textContent = 'IPGeolocationLatency: ' + responseJson['ipgeolocationLatency'];
        sunriseStatus.textContent = 'SunriseSunsetRunning: ' + responseJson['sunriseSunsetRunning'];
        sunriseLatency.textContent = 'SunriseSunsetLatency: ' + responseJson['sunriseSunsetLatency'];
        [mapBoxStatus,mapBoxLatency,openWeatherStatus,openWeatherLatency,ipgeolocationStatus,ipgeolocationLatency,sunriseStatus,sunriseLatency]
          .forEach(async function(e){
            e.className = 'data';
            e.style = "color:orange;margin-bottom:0px;font-weight:bold;"
          })
        contentPanel.append(mapBoxStatus,mapBoxLatency,openWeatherStatus,openWeatherLatency,ipgeolocationStatus,ipgeolocationLatency);
        contentPanel.append(sunriseLatency,sunriseStatus);

    }).catch((error) => {
        console.log(error)
        var errorText = document.createElement('p');
        errorText.textContent = 'Something went wrong fetching monitor data errorcode:'+ error +"!";
        errorText.style = "color:red";
        errorText.className = "data"
        contentPanel.append(errorText);

    })
}

searchButton.onclick = function(){
    lookupLocation = searchBar.value;
    [].forEach.call(document.querySelectorAll('.data'),function(e){
        e.parentNode.removeChild(e);
      });
    getDataFromAPI(lookupLocation);
}

metricsButton.onclick = function(){
    [].forEach.call(document.querySelectorAll('.data'),function(e){
        e.parentNode.removeChild(e);
      });
    getMetricsFromAPI();
}

benchmarkButton.onclick = function(){
    sendNRequestBatchesTo(2,5,domain + ':' + port + '/api');
}

checkButton.onclick = function(){
    [].forEach.call(document.querySelectorAll('.data'),function(e){
        e.parentNode.removeChild(e);
      });
      getMonitorFromAPI();
}