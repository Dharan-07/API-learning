const { ethers } = require('ethers');
const { contract, wallet } = require('./config')

const express = require('express')
const app = express();

app.use(express.json());


// these are the specified endpoint to interact with
app.get("/", (req, res) => {
    res.send("API Running....");
});

//using a specific endpoint with params 
app.get("/balanceOf/:address", async (req, res) => {
    try {
        const address = req.params.address;
        const balanceOf = await contract.balanceOf(address);
        res.json({
            address,
            balanceOf: balanceOf.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/allowance/:owner/:spender", async (req, res) => {
    try {
        const owner = req.params.owner;
        const spender = req.params.spender;

        const allowance = await contract.allowance(owner, spender);

        res.json({
            owner,
            spender,
            allowance: allowance.toString()
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//mint function with post method , giving input as json in body 
app.post("/mint", async (req, res) => {
    try {
        const { to, amount } = req.body; // giving input as json in body, to execute this line is needed app.use(express.json());

        if (!to || !amount) {
            return res.status(400).json({
                error: "Address and amount are required."
            });
        }

        const tx = await contract.mint(to, amount);
        const receipt = await tx.wait();

        res.status(200).json({
            to: to,
            amount: amount,
            success: true,
            message: "Tokens minted successfully.",
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/owner", async (req, res) => {

    try {
        const owner = await contract.owner();
        res.status(200).json({ owner: owner })
    } catch (error) {
        req.status(500).json({ error: error.message });
    }
});

app.put("/transferOwnership", async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(500).json({
                error: "new owner address is required."
            })
        }

        const tx = await contract.transferOwnership(address);
        const receipt = await tx.wait();

        res.status(200).json({
            success: true,
            newOwner: address,
            message: "Ownership transferred successfully",
            transactionHash: tx.hash
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
});

app.patch("/transferOwnership", async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(500).json({
                error: "new owner address is required."
            })
        }

        const tx = await contract.transferOwnership(address);
        const receipt = await tx.wait();

        res.status(200).json({
            success: true,
            newOwner: address,
            message: "Ownership transferred successfully",
            transactionHash: tx.hash
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
});

// BY using this we creating a server in a specified port address, this is the starting point  
app.listen(3000, () => {
    console.log("server running on port 3000")
}); 