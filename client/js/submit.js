const domain = "http://localhost";
const port = 3000;
var searchBar = document.querySelector('.searchLocation');
var searchButton = document.querySelector('.searchButton');
var contentPanel = document.querySelector('.content');

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
        errorText.textContent = 'Given location cannot be found or something went wrong!';
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