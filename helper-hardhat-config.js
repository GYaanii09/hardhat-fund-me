const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPricefeed: "0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
