const express = require("express");
const server = express();
const filmsService = require("./services/media/index")
PORT = 5000

server.use(express.json());

server.use('/media', filmsService)

server.listen(PORT,()=>{
    console.log(`Your server is launched at launchpad ${PORT}`)
})