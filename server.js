const hostname = 'localhost';
const port = 3000;
const mongoose = require('mongoose');
const server = require('./router.js');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify: false
}).then(() => console.log("Succesfully connected to DB"));


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
