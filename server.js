const express = require("express");
const server = express();
PORT = 5000

server.use(express.json());



server.listen(PORT,()=>{
    console.log(`Your server is launched at launchpad ${PORT}`)
})