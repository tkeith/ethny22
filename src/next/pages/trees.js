import Frame from '../components/Frame.js';
import { TextButton } from '../components/examples/misc.js';
import { address, abi } from '../../lib/contract.js';
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useCall, useContractFunction } from '@usedapp/core';
import Web3 from 'web3'
import { useState, useEffect } from 'react';
import { useEtherBalance, useEthers } from '@usedapp/core'
import axios from 'axios'
// import getMongo from '../../lib/mongo.js';

const contract = new Contract(address, new utils.Interface(abi));

export default function Trees({ address, abi }) {

  //////////////////////////////
  // TREE MINTING

  const [mintCost, setMintCost] = useState()

  useEffect(() => {

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

  }, [])

  const contract = new Contract(address, abi)

  const { state, send } = useContractFunction(contract, 'plantSeed', { transactionName: 'PlantSeed' })
  const { status } = state

  async function doMint() {
    send({ value: mintCost })
  }

  //////////////////////////////
  // TREE LISTING

  const { account } = useEthers()

  let [myTrees, setMyTrees] = useState()

  useEffect(() => {

    const updateMyTrees = async () => {
      let url = '/express/treesByUser/' + account
      const res = await axios.get(url)
      setMyTrees(res.data)
    }

    updateMyTrees()

    const interval = setInterval(updateMyTrees, 3000)
    return () => { clearInterval(interval) }
  }, [account])

  //////////////////////////////
  // PAGE

  return <>
    <Frame title='Trees' accountRequired>
      <p>Cost to plant a new seed: {mintCost / 1000000000000000000} ETH</p>
      <TextButton onClick={() => doMint()}>Plant a new seed</TextButton>

      <ul role="list" className="my-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {myTrees && myTrees.map((tree) => (
          <li key={tree.image} className="relative">
            <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
              <img src={tree.image} alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
              <button type="button" className="absolute inset-0 focus:outline-none">
                <span className="sr-only"></span>
              </button>
            </div>
            <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">Tree #{tree.tokenId} {tree.currentlyOwned && <span class="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded">Currently owned</span>}</p>
            {/* <p className="block text-sm font-medium text-gray-500 pointer-events-none">{tree.currentOwner.substring(0, 20)}...</p> */}
          </li>
        ))}
      </ul>

      {/* <p>{JSON.stringify(myTrees)}</p> */}
    </Frame>
  </>
}

export async function getServerSideProps() {
  // const mongo = await getMongo()
  // const myTrees = await mongo.collection('trees').find({  })

  // const myTrees =

  return {
    props: {
      address: address,
      abi: abi,
      // myTrees: myTrees,
    }
  }
}
