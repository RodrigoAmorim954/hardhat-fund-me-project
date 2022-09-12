const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const {
    developmentChains,
    networkConfig
} = require("../../helper-hardhat-config")

if (developmentChains.includes(networkConfig)) {
    describe("FundMe", async () => {
        let fundMe, deployer
        const sendValue = ethers.utils.parseEther("0.2")
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function() {
            const fundTxResponse = await fundMe.fund({ value: sendValue })
            await fundTxResponse.wait(1)
            const withdrawTxResponse = await fundMe.withdraw()
            await withdrawTxResponse.wait(1)

            const endingBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            assert.equal(endingBalance.toString(), "0")
        })
    })
} else {
    describe.skip
}
