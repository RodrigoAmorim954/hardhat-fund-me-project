const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    // those 3 variables come from hre (hardhat runtime environment)
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    // if the contract doens't exist, we deploy a minimum version of for our local testing
    // when going for localhost or hardhat network we want to use a mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        // verify
        await verify(fundMe.address, args)
    }
    log("-------------------------------------")
}

module.exports.tags = ["all", "fundme"]
