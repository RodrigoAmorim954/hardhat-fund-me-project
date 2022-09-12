//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// MAXIMUM
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // We could make this public, but then we'd have to deploy it
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // To access the ChainLink contract ETH/USD Updated price, we need the ABI and the address of the contract
        // the address for the goerli teste net can be founded at: https://docs.chain.link/docs/ethereum-addresses/
        // THe address is: 	0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

        (, int256 price, , , ) = priceFeed.latestRoundData();

        return uint256(price * 1e10); // the value come with 8 decimals besides the original value, so we need to multiply by e10 to have the 18 decimals.
        // also is needed to typecasting to uint256 because the msg.sender has the uint256 type
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUsd;
    }
}
