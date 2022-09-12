const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, getChainId } = require("hardhat")
const {
    developmentChains,
    networkConfig
} = require("../../helper-hardhat-config")

if (!developmentChains.includes(networkConfig)) {
    describe("FundMe", async () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1")
        beforeEach(async () => {
            // Deploy our fundMe contract using hardhat deploy
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"]) //allows to deploy our entire deploy folder with many tags as we want
            fundMe = await ethers.getContract("FundMe", deployer) // get the most recent deployment of whatever contract we tell it
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", async () => {
            it("sets the aggregator address correctly", async () => {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async () => {
            it("fails if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need at least 50 dol in ethers"
                )
            })
            it("update the amount funded data structured", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Adds funder to array of getFunder", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getFunder(0)
                assert.equal(deployer, response)
            })
        })

        describe("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })

            it("Withdraw ETH from a single founder", async () => {
                // Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.address
                )
                const startingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )
                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )
                // Assert

                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    endingDeployerBalance.add(gasCost).toString(),
                    startingDeployerBalance
                        .add(startingFundMeBalance)
                        .toString()
                )
            })

            it("allows us to cheaper_withdraw with multiple getFunder", async () => {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }

                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.address
                )
                const startingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )
                // Act

                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                // Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    endingDeployerBalance.add(gasCost).toString(),
                    startingDeployerBalance
                        .add(startingFundMeBalance)
                        .toString()
                )

                // Make sure if the getFunder reset properly

                await expect(fundMe.getFunder(0)).to.be.reverted

                for (i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(
                            accounts[i].address
                        ),
                        0
                    )
                }
            })

            it("Only allows the owner to withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be
                    .reverted
            })
        })
    })
} else {
    describe.skip
}
