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
  }

  // Mint cost = mintCostFixed + 2 ^ (mintCostPowerMultiplier * tokenId)
  uint256 mintCost = 1000000000000000000; // 1 ETH - TODO remove when dynamic mint cost is implemented
  uint256 growthDivisor = 1000000000000000000; // 1 ETH per meter
  uint256 sproutSize = 1; // meters needed before the tree sprouts

  Counters.Counter numberOfTrees;

  mapping(uint256 => uint256) sizes;
  mapping(uint256 => uint256) rarities;

  mapping(uint256 => Owner[]) owners;

  constructor() ERC721("ChubbyGrubbies", "CHUBBY") {}

  event SeedPlanted(
    address owner,
    uint256 tokenId
  );

  event TreeChange(
    uint256 tokenId
  );

  function getTreeDisplay(uint256 tokenId) public view returns(TreeDisplay memory) {
    require(isTree(tokenId), "Invalid token ID");
    return TreeDisplay(
      rarities[tokenId],
      sizes[tokenId],
      owners[tokenId]
    );
  }

  function _generateRarity() internal returns(uint256) {
    return block.timestamp % 5 + 1; // TODO randomly choose 1-5
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

  function plantSeed() public payable {
    uint256 thisMintCost = getCurrentMintCost();
    require(msg.value >= thisMintCost, "Mint cost not covered");

    numberOfTrees.increment();
    address newOwner = msg.sender;
    uint256 newTokenId = numberOfTrees.current();
    _mint(newOwner, newTokenId);

    _handleTreeGrowth(newTokenId, msg.value - thisMintCost);

    emit SeedPlanted(newOwner, newTokenId);
    emit TreeChange(newTokenId);
  }

  function growTree(uint256 tokenId) public payable {
    require(isTree(tokenId), "Invalid token ID");
    require(msg.value > 0, "Must spend to grow tree");
    _handleTreeGrowth(tokenId, msg.value);
    emit TreeChange(tokenId);
  }
}
