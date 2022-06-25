import Frame from '../components/Frame.js';
import { TextButton } from '../components/examples/misc.js';
import { address, abi } from '../../lib/contract.js';
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useCall, useContractFunction } from '@usedapp/core';
import Web3 from 'web3'
import { useState } from 'react';

const contract = new Contract(address, new utils.Interface(abi));

export default function Trees({ address, abi }) {
  const [mintCost, setMintCost] = useState()

  async function getCurrentMintCost() {
    const mmWeb3 = new Web3(window.ethereum);
    const contract = new mmWeb3.eth.Contract(abi, address)
    console.log("Calling allowance: ")
    await contract.methods.getCurrentMintCost().call(function (error, result) {
      console.log("Current mint cost: ", result)
      setMintCost(result)
    })
  }

  getCurrentMintCost()

  const contract = new Contract(address, abi)

  const { state, send } = useContractFunction(contract, 'plantSeed', { transactionName: 'PlantSeed' })
  const { status } = state

  async function doMint() {
    send({ value: mintCost })
  }

  return <>
    <Frame title='Trees' accountRequired>
      <p>Cost to plant a new seed: {mintCost / 1000000000000000000} ETH</p>
      <TextButton onClick={() => doMint()}>Plant a new seed</TextButton>
    </Frame>
  </>
}

export async function getServerSideProps() {
  return {
    props: {
      address: address,
      abi: abi,
    }
  }
}
