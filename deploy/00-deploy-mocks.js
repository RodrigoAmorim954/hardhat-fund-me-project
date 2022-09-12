const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    // those 3 variables come from hre (hardhat runtime environment)
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    if (chainId == 31337) {
        log("Local network detected! Deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        })
        log("Mock Deployed!")
        log("---------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
