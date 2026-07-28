const http = require("http");
const { ethers } = require("ethers");
const { contract } = require("./Vestingconfig");

const PORT = 4000;

const server = http.createServer(async (req, res) => {

    // Common response header
    res.setHeader("Content-Type", "application/json");

    // ============================
    // GET /
    // ============================
    if (req.method === "GET" && req.url === "/") {

        res.writeHead(200);

        res.end(JSON.stringify({
            message: "API Running..."
        }));

        return;
    }

    // ============================
    // GET /owner
    // ============================
    if (req.method === "GET" && req.url === "/owner") {

        try {

            const owner = await contract.owner();

            res.writeHead(200);

            res.end(JSON.stringify({
                owner
            }));

        } catch (err) {

            res.writeHead(500);

            res.end(JSON.stringify({
                success: false,
                error: err.message
            }));

        }

        return;
    }

    // ============================
    // POST /vest
    // ============================
    if (req.method === "POST" && req.url === "/vest") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const tx = await contract.vest(
                    data.beneficiary,
                    ethers.parseUnits(data.amount.toString(), 18),
                    data.cliffPeriod,
                    data.vestingPeriod,
                    data.timeUnit
                );

                await tx.wait();

                res.writeHead(200);

                res.end(JSON.stringify({
                    success: true,
                    transactionHash: tx.hash,
                    message: "Vesting created successfully"
                }));

            } catch (err) {

                res.writeHead(500);

                res.end(JSON.stringify({
                    success: false,
                    error: err.message
                }));

            }

        });

        return;
    }

    // ============================
    // POST /claim
    // ============================
    if (req.method === "POST" && req.url === "/claim") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {

                const { vestId } = JSON.parse(body);

                const tx = await contract.claim(vestId);

                const receipt = await tx.wait();

                let claimedInfo = null;

                for (const log of receipt.logs) {

                    try {

                        const parsed = contract.interface.parseLog(log);

                        if (parsed.name === "TokenClaimed") {

                            claimedInfo = {
                                beneficiary: parsed.args.beneficiary,
                                vestId: parsed.args.vestingId.toString(),
                                amount: ethers.formatUnits(parsed.args.amount, 18)
                            };

                            break;
                        }

                    } catch (_) { }
                }

                res.writeHead(200);

                res.end(JSON.stringify({
                    success: true,
                    transactionHash: tx.hash,
                    claimedInfo
                }));

            } catch (err) {

                res.writeHead(500);

                res.end(JSON.stringify({
                    success: false,
                    error: err.message
                }));

            }

        });

        return;
    }

    // ============================
    // POST /claimAll
    // ============================
    if (req.method === "POST" && req.url === "/claimAll") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {

                const tx = await contract.claimAll();

                const receipt = await tx.wait();

                const claimedVestings = [];

                for (const log of receipt.logs) {

                    try {

                        const parsed = contract.interface.parseLog(log);

                        if (parsed.name === "TokenClaimed") {

                            claimedVestings.push({
                                beneficiary: parsed.args.beneficiary,
                                vestId: parsed.args.vestingId.toString(),
                                amount: ethers.formatUnits(parsed.args.amount, 18)
                            });

                        }

                    } catch (_) { }
                }

                res.writeHead(200);

                res.end(JSON.stringify({
                    success: true,
                    transactionHash: tx.hash,
                    totalVestingsClaimed: claimedVestings.length,
                    claimedVestings
                }));

            } catch (err) {

                res.writeHead(500);

                res.end(JSON.stringify({
                    success: false,
                    error: err.message
                }));

            }

        });

        return;
    }

    // ============================
    // Route Not Found
    // ============================

    res.writeHead(404);

    res.end(JSON.stringify({
        error: "Route Not Found"
    }));

});

server.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});