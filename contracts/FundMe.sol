//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner(); // throw a error, used like require, the difference is that save gas

/**
 * @author Rodrigo
 * @title  A contract to crowd funding
 * @notice This contract is to demo a sample funding contract
 * @dev this implements price feeds as our library
 */

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 1e18; // Minimum USD value that we will afford tu use the fund function

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        // require(msg.sender == i_owner, "you are not the owner!");
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // those function does not have the function keyword and needs to be external and payable
    receive() external payable {
        // special function needed so we can send eth without calling the normal functions
        // only used if we doesn't send any data
        fund();
    }

    fallback() external payable {
        // used only if not exist a receive function and if we send any data besides the ether
        fund();
    }

    /**
     * @notice This function funds this contract
     * @dev this implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need at least 50 dol in ethers"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        // We need to empty all addresses, so we use a for to iterate in all indexes
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funderAdress = s_funders[funderIndex]; // we create a variable address to access the address of the array
            s_addressToAmountFunded[funderAdress] = 0; // we set to zero the value
        }
        s_funders = new address[](0); // a brand new address array with zero objects in it to ( a completely blank new array )
        // to withdraw the funds we have 3 options: transfer, call, send
        /*
        // the transfer function with fail throws a error
        payable(msg.sender).transfer(address(this).balance); // to receive ether the address variable needs to be payable

        // the send function returns a bool, so we need to check if a require statement
        boll sendSucess = payable(msg.sender).send(address(this).balance);
        require(sendSucess, "Send failed!");*/

        // the call function returns two paramers, a bool and a bytes data (if call a function that returns data)
        (
            bool callSucess, /* bytes memory dataReturned */

        ) = i_owner.call{value: address(this).balance}("");
        require(callSucess, "Call failed!");
        // For some reason that I don't know yet, the call function is the best way to send ether
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //mappings cant be in memory!!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool sucess, ) = i_owner.call{value: address(this).balance}("");
        require(sucess);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
