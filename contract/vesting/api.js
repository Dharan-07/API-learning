const { ethers } = require('ethers');
const { contract, wallet } = require('./Vestingconfig')

const express = require('express')
const app = express();

app.use(express.json());


// these are the specified endpoint to interact with
app.get("/", (req, res) => {
    res.send("API Running....");
});

app.get("/owner", async (req, res) => {

    try {
        const owner = await contract.owner();
        res.status(200).json({ owner: owner })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/vest", async (req, res) => {
    try {

        const {
            beneficiary,
            amount,
            cliffPeriod,
            vestingPeriod,
            timeUnit
        } = req.body;

        const tx = await contract.vest(
            beneficiary,
            ethers.parseUnits(amount.toString(), 18),
            cliffPeriod,
            vestingPeriod,
            timeUnit
        )

        const receipt = await tx.wait();

        res.json({
            success: true,
            transactionHash: tx.hash,
            message: "Vesting created successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

app.post("/claim", async (req, res) => {

    try {
        const { vestId } = req.body;

        const tx = await contract.claim(vestId);
        const receipt = await tx.wait();

        res.status(200).json({
            success: true,
            transactionHash: tx.hash,
            message: "amount claimed successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// BY using this we creating a server in a specified port address, this is the starting point  
app.listen(4000, () => {
    console.log("server running on port 4000")
}); 