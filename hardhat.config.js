require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")

const PRIVATE_KEY = process.env.PRIVATE_KEY
const GOERLY_RPC_URL = process.env.GOERLY_RPC_URL
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337
        },
        goerly: {
            chainId: 5,
            url: GOERLY_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.6"
            }
        ]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-reporter.txt",
        noColors: true
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        } // the one means ethereum main net or the chain id
    },
    mocha: {
        timeout: 500000
    }
}
