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

        // Call the smart contract
        const tx = await contract.claim(vestId);

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        let claimedInfo = null;

        // Read all logs emitted by the transaction
        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);

                // Process only TokenClaimed event
                if (parsedLog.name === "TokenClaimed") {
                    claimedInfo = {
                        beneficiary: parsedLog.args.beneficiary,
                        vestId: parsedLog.args.vestingId.toString(),
                        amount: ethers.formatUnits(parsedLog.args.amount, 18)
                    };

                    break; // Only one TokenClaimed event is expected
                }
            } catch (err) {
                // Ignore logs that don't belong to this contract
            }
        }

        res.status(200).json({
            success: true,
            transactionHash: tx.hash,
            claimedInfo,
            message: "Amount claimed successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


app.post("/claimAll", async (req, res) => {
    try {

        // 1. Call the smart contract
        const tx = await contract.claimAll();

        // 2. Wait until the transaction is mined
        const receipt = await tx.wait();

        // 3. Store all claimed vesting information
        const claimedVestings = [];

        // 4. Loop through every log emitted in the transaction
        for (const log of receipt.logs) {

            try {

                // Decode the log using your vesting contract ABI
                const parsedLog = contract.interface.parseLog(log);

                // Only process TokenClaimed events
                if (parsedLog.name === "TokenClaimed") {

                    claimedVestings.push({
                        beneficiary: parsedLog.args.beneficiary,
                        vestId: parsedLog.args.vestingId.toString(),
                        amount: ethers.formatUnits(parsedLog.args.amount, 18)
                    });

                }

            } catch (err) {
                // Ignore logs that don't belong to this contract
            }
        }

        // 5. Send response
        res.status(200).json({
            success: true,
            transactionHash: tx.hash,
            totalVestingsClaimed: claimedVestings.length,
            claimedVestings,
            message: "All claimable vestings claimed successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// BY using this we creating a server in a specified port address, this is the starting point  
app.listen(4000, () => {
    console.log("server running on port 4000")
}); 