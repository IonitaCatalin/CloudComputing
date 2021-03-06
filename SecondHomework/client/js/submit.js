const domain = "http://localhost";
var searchBar = document.querySelector('.searchLocation');
var metricsButton = document.querySelector('.metricsButton');
var searchButton = document.querySelector('.searchButton');
var contentPanel = document.querySelector('.content');
var benchmarkButton = document.querySelector('.benchmarkButton');
var checkButton = document.querySelector('.checkButton');
const port = 3000;


async function sendReqWorker(sendTo,batchId,locations){
    var worker = new Worker('http://localhost:3000/js/worker.js');
    return new Promise((resolve,reject) =>{
        let result;
        const randLocation = locations[Math.floor(Math.random() * locations.length)];
        worker.postMessage([batchId,randLocation,sendTo,Date.now()]);
        worker.onmessage = function(e){
                result = e;
                resolve(result);
            }
    })
}

async function fillBatchArray(requests,sendTo,batchId,locations){
    return Array(requests).fill(sendReqWorker(sendTo,batchId,locations))
}


async function sendNBatchesTo(batches,requests,endpoint,locations)
{   
    for(let index = 0 ; index < batches ; index++){
        let promiseArray = await fillBatchArray(requests,endpoint,index,locations);
        Promise.all(promiseArray).then( results =>{
            let averageLatency = 0 ;
            let failedReq = 0;
            let successReq = 0;
            let batchIndex = results[0].data[0];
            for(let result in results){
                data = results[result].data;
                averageLatency += Date.now() - data[3];
                (data[1] == 200) ? successReq++ : failedReq++
            }
            let info = document.createElement('p');
            info.textContent = `Batch#${batchIndex}(Req:${requests}) | Latency:${averageLatency} ms | FailReq: ${failedReq} | SuccReq:${successReq}`;
            info.className = 'data';
            info.style = 'color:red;'
            contentPanel.append(info);

        });

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
            throw new Error(response);
        }
    }).then((responseJson) =>{
            let result = responseJson['content'];
            let location = document.createElement('p');
            let latitude = document.createElement('p');
            let longitude = document.createElement('p');
            let temperatureCelsius = document.createElement('p')
            let windKph = document.createElement('p');
            let date = document.createElement('p');
            let time = document.createElement('p');
            let dayLength = document.createElement('p');
            [location,latitude,longitude,temperatureCelsius,windKph,date,time,dayLength].forEach(async function(e){
                e.className = 'data';
                e.style = "color:green;margin-bottom:0px;"
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
        let errorText = document.createElement('p');
        errorText.textContent = 'Something went wrong while fetching data,check for input not to be empty';
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
        let averageLatency = document.createElement('p');
        let maxLatency = document.createElement('p');
        let getCount = document.createElement('p');
        let postCount = document.createElement('p');
        let lastRequestTimestamp = document.createElement('p');
        averageLatency.textContent = 'AverageLatency: '+responseJson['averageLatency'] + 'ms';
        maxLatency.textContent = 'MaxLatency: '+responseJson['biggestLatency'] + 'ms';
        getCount.textContent = 'GET-RequestCount: '+responseJson['getRequestsCount'];
        postCount.textContent = 'POST-RequestCount: '+responseJson['postRequestsCount'];
        lastRequestTimestamp.textContent = 'LastRequestTimestamp: ' + responseJson['lastRequest']['timestamp'];
        [averageLatency,maxLatency,getCount,postCount,lastRequestTimestamp].forEach(async function(e){
            e.className = 'data';
            e.style = "color:red;margin-bottom:0px;"
        })
        contentPanel.append(averageLatency,maxLatency);
        contentPanel.append(getCount,postCount,lastRequestTimestamp);
           
    }).catch((error) => {
        let errorText = document.createElement('p');
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
        let mapBoxStatus = document.createElement('p');
        let mapBoxLatency = document.createElement('p');
        let openWeatherStatus = document.createElement('p');
        let openWeatherLatency = document.createElement('p');
        let ipgeolocationStatus = document.createElement('p');
        let ipgeolocationLatency = document.createElement('p');
        let sunriseStatus = document.createElement('p');
        let sunriseLatency = document.createElement('p');


        mapBoxStatus.textContent = 'MapBoxStatus: ' + responseJson['mapBoxRunning'];
        mapBoxLatency.textContent = 'MapBoxLatency: ' + responseJson['mapBoxLatency'] + 'ms';
        openWeatherStatus.textContent = 'OpenWeatherRunning: ' + responseJson['openWeatherRunning'];
        openWeatherLatency.textContent = 'OpenWeatherLatency: ' + responseJson['openWeatherLatency'] + 'ms';
        ipgeolocationStatus.textContent = 'IPGeolocationRunning: ' + responseJson['ipgeolocationRunning'];
        ipgeolocationLatency.textContent = 'IPGeolocationLatency: ' + responseJson['ipgeolocationLatency'] + 'ms';
        sunriseStatus.textContent = 'SunriseSunsetRunning: ' + responseJson['sunriseSunsetRunning'];
        sunriseLatency.textContent = 'SunriseSunsetLatency: ' + responseJson['sunriseSunsetLatency']+' ms';
        [mapBoxStatus,mapBoxLatency,openWeatherStatus,openWeatherLatency,ipgeolocationStatus,ipgeolocationLatency,sunriseStatus,sunriseLatency]
          .forEach(async function(e){
            e.className = 'data';
            e.style = "color:orange;margin-bottom:0px;font-weight:bold;"
          })
        contentPanel.append(mapBoxStatus,mapBoxLatency,openWeatherStatus,openWeatherLatency,ipgeolocationStatus,ipgeolocationLatency);
        contentPanel.append(sunriseLatency,sunriseStatus);

    }).catch((error) => {
        console.log(error)
        let errorText = document.createElement('p');
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
    [].forEach.call(document.querySelectorAll('.data'),function(e){
        e.parentNode.removeChild(e);
      });
    sendNBatchesTo(10,3,domain+':'+port+'/api',['Paris','Moroco','Alaska','Angola']);
}

checkButton.onclick = function(){
    [].forEach.call(document.querySelectorAll('.data'),function(e){
        e.parentNode.removeChild(e);
      });
      getMonitorFromAPI();
}