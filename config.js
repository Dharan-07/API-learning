require("dotenv").config();

const { ethers } = require('ethers');
const express = require('express');

const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
);

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

const artifact = require('./abi/stakingToken.json');
const abi = artifact.abi;

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
)

module.exports = {
    contract,
    wallet
};

// console.log(artifact);
// console.log("---------");
// console.log("---------");
// console.log(abi);