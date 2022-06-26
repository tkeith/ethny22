require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "optimism",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10
    }
  },
  // etherscan: {
  //   apiKey: process.env.POLYGONSCAN_API_KEY
  // }
};
