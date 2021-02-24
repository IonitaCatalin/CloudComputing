const domain = 'http://localhost'
const port = 3000


self.addEventListener('message', async function(e) {
    const batchId = e.data[0];
    const location = e.data[1];
    const sendTo = e.data[2];
    var status;

    var reqResult = await fetch(sendTo,{
        headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json'
        },
        method:"POST",
        body : JSON.stringify({'location':location})
    }).then(response => {
        status = response.status;
        return response.json();
    }).catch(err =>{
        status = 500;
    })
    
    self.postMessage([batchId,status,reqResult]);

}, false);