require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "boba",
  networks: {
    boba: {
      // url: "https://mainnet.boba.network/",
      url: "https://rinkeby.boba.network",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 28,
    }
  },
  etherscan: {
    apiKey: {
      // boba: process.env.BOBA_EXPLORER_API_KEY
      boba: "asdf"
    },
    customChains: [
      {
        network: "boba",
        // chainId: 288,
        chainId: 28,
        urls: {
          // apiURL: "https://blockexplorer.boba.network/api",
          apiURL: "https://blockexplorer.rinkeby.boba.network/api/eth-rpc",
          browserURL: "https://blockexplorer.rinkeby.boba.network/"
        }
      }
    ]
  },
};
