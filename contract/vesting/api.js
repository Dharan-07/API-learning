const { ethers } = require('ethers');
const { contract, wallet } = require('./Vestingconfig')

const express = require('express')
const app = express();

app.use(express.json());


// these are the specified endpoint to interact with
app.get("/", (req, res) => {
    res.send("API Running....");
});


// BY using this we creating a server in a specified port address, this is the starting point  
app.listen(4000, () => {
    console.log("server running on port 4000")
}); 