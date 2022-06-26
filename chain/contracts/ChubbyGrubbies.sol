pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChubbyGrubbies is ERC721 {
  using Counters for Counters.Counter;

  struct Owner {
    uint256 begin; // time when this owner gained the NFT
    address owner;
  }

  struct TreeDisplay {
    uint256 rarity; // 0 if not sprouted
    uint256 size;
    Owner[] owners;
    // bytes32 ownersHash;
    string ipfsHash;
  }

  // Dynamic mint cost = mintCostFixed + 2 ^ (mintCostPowerMultiplier * tokenId)

  uint256 mintCost = 1000000000000000000 / 1000;                // 1/1000 ETH - TODO remove when dynamic mint cost is implemented
  uint256 growthDivisor = 1000000000000000000 / 1000;           // 1/1000 ETH per meter
  uint256 sproutSize = 1;                                       // meters needed before the tree sprouts
  address admin = 0xc4d78162471cFFd293850C6ed4FD618240a75F1b;   // allowed to push IPFS hashes

  string loadingIpfsHash = "QmcZTSMUMvFftMqqUBFy5jVyEXgAGmRSt2X8LqGLBc5QPU";
  string seedIpfsHash = "QmQo2tQZaQujodPRYQGmYFC6umNhsEwqEsx4mZpPn8uLkc";

  Counters.Counter numberOfTrees;

  mapping(uint256 => uint256) sizes;
  mapping(uint256 => uint256) rarities;
  mapping(uint256 => Owner[]) owners;
  mapping(uint256 => string) ipfsHashes;

  constructor() ERC721("ChubbyGrubbies", "CHUBBY") {}

  event SeedPlanted(
    address owner,
    uint256 tokenId
  );

  event TreeChange(
    uint256 tokenId,
    uint256 rarity,
    uint256 size,
    Owner[] owners
  );

  function getTreeDisplay(uint256 tokenId) public view returns(TreeDisplay memory) {
    require(isTree(tokenId), "Invalid token ID");
    return TreeDisplay(
      rarities[tokenId],
      sizes[tokenId],
      owners[tokenId],
      // keccak256(owners[tokenId]),
      ipfsHashes[tokenId]
    );
  }

  function _generateRarity() internal view returns(uint256) {
    uint256 randNum = block.timestamp % 14;
    uint256 rarity;
    if (randNum < 8) {
      rarity = 1;
    } else if (randNum < 8 + 4) {
      rarity = 2;
    } else {
      rarity = 3;
    }
    return rarity; // TODO randomly choose 1-5
  }

  function isTree(uint256 tokenId) public view returns(bool) {
    return tokenId <= numberOfTrees.current();
  }

  function isSprouted(uint256 tokenId) public view returns(bool) {
    return rarities[tokenId] != 0;
  }

  function _handleTreeSprout(uint256 tokenId) internal {
    require(!isSprouted(tokenId), "BUG! Rarity should not already be set");
    require(isTree(tokenId), "Invalid token ID");
    uint256 rarity = _generateRarity();
    rarities[tokenId] = rarity;
  }

  function _handleTreeGrowth(uint256 tokenId, uint256 spendAmount) internal {
    require(isTree(tokenId), "Invalid token ID");
    uint256 growthAmount = spendAmount / growthDivisor;
    sizes[tokenId] += growthAmount;
    if ((!isSprouted(tokenId)) && sizes[tokenId] >= sproutSize) {
      _handleTreeSprout(tokenId);
    }
  }

  function getCurrentMintCost() public view returns(uint256) {
    return mintCost; // TODO dynamic mint cost
  }

  function _afterTokenTransfer(address /* from */, address to, uint256 tokenId) internal override {
    owners[tokenId].push(Owner(block.timestamp, to));
  }

  // function tokenURI(uint256 tokenId) override public view returns(string memory) {
  //   require(isTree(tokenId), "Invalid token ID");
  //   return "https://demo.storj-ipfs.com/ipfs/" + ipfsHashes[tokenId];
  // }
  function _baseURI() override internal pure returns(string memory) {
    return "https://demo.storj-ipfs.com/ipfs/";
  }

  function _emitTreeChange(uint256 tokenId) internal {
    emit TreeChange(
      tokenId,
      rarities[tokenId],
      sizes[tokenId],
      owners[tokenId]
    );
  }

  function plantSeed() public payable {
    uint256 thisMintCost = getCurrentMintCost();

    require(msg.value >= thisMintCost, "Mint cost not covered");

    numberOfTrees.increment();
    address newOwner = msg.sender;
    uint256 newTokenId = numberOfTrees.current();
    _mint(newOwner, newTokenId);

    ipfsHashes[newTokenId] = seedIpfsHash;

    _handleTreeGrowth(newTokenId, msg.value - thisMintCost);

    emit SeedPlanted(newOwner, newTokenId);
    _emitTreeChange(newTokenId);
  }

  function setIpfsHash(uint256 tokenId, string calldata ipfsHash) public {
    require(msg.sender == admin);
    require(isTree(tokenId), "Invalid token ID");

    ipfsHashes[tokenId] = ipfsHash;
  }

  function growTree(uint256 tokenId) public payable {
    require(isTree(tokenId), "Invalid token ID");
    require(msg.value > 0, "Must spend to grow tree");

    _handleTreeGrowth(tokenId, msg.value);

    ipfsHashes[tokenId] = loadingIpfsHash;

    _emitTreeChange(tokenId);
  }
}
