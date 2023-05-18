//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getprice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //ABI
        //Address to interact
        //0x694AA1769357215DE4FAC081bf1f309aDC325306

        /* (uint80 roundId, int price, uint startedAt, uint timeStamp, uint answeredInRound)  = priceFeed.latestRoundData();*/
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //price is the price of eth in terms of usd
        return uint256(price * 1e10); //to adjust decimal
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getprice(priceFeed);
        uint256 ethAmouninUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmouninUsd;
    }
}
