const http = require('http');
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(express.static(__dirname + '/client'));
app.use('/static', express.static(__dirname + '/client'));

require('dotenv').config()

app.get('/metrics', (req, res) => {
    console.log('To be replaced with some metrics')
  })

app.post('/api',(req,res)=>{

})

app.get('/client',(req,res)=>{
    res.status(200).sendFile(__dirname + '/client/index.html');
})

  
app.listen(port, () => {
    console.log('App received a connection to the port 3000')
 })




