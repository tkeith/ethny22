import Frame from '../components/Frame.js';
import { TextButton, SubmitButton, TextInput } from '../components/examples/misc.js';
import { address, abi } from '../../lib/contract.js';
import { utils, BigNumber } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useCall, useContractFunction } from '@usedapp/core';
import Web3 from 'web3'
import { useState, useEffect } from 'react';
import { useEtherBalance, useEthers } from '@usedapp/core'
import axios from 'axios'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
// import getMongo from '../../lib/mongo.js';

const contract = new Contract(address, new utils.Interface(abi));


export default function Trees({ address, abi }) {

  //////////////////////////////
  // MINTING COST INFO

  const [mintCost, setMintCost] = useState()

  useEffect(() => {

    async function getCurrentMintCost() {
      const mmWeb3 = new Web3(window.ethereum);
      const contract = new mmWeb3.eth.Contract(abi, address)
      await contract.methods.getCurrentMintCost().call(function (error, result) {
        console.log("Current mint cost: ", result)
        setMintCost(result)
      })
    }

    getCurrentMintCost()

  }, [])

  //////////////////////////////
  // TREE MINTING

  const contract = new Contract(address, abi)

  const plantHook = useContractFunction(contract, 'plantSeed', { transactionName: 'PlantSeed' })

  async function doMint() {
    plantHook.send({ value: mintCost })
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

    const interval = setInterval(updateMyTrees, 1000)
    return () => { clearInterval(interval) }
  }, [account])


  //////////////////////////////
  // MODAL

  const [open, setOpen] = useState(false)
  const [modalTree, setModalTree] = useState()
  const [waterSuccess, setWaterSuccess] = useState(false)

  function openModal(tree) {
    setModalTree(tree);
    setWaterSuccess(false);
    setOpen(true);
  }

  //////////////////////////////
  // TREE WATERING

  const growHook = useContractFunction(contract, 'growTree', { transactionName: 'GrowTree' })

  async function waterTree(event) {
    event.preventDefault()

    const amount = utils.parseEther(event.target.amount.value);

    growHook.send(modalTree.tokenId, { value: amount })

    setWaterSuccess(true);

  }

  //////////////////////////////
  // SEND TREE

  const sendHook = useContractFunction(contract, 'transferFrom', { transactionName: 'Send' })

  async function sendTree(event) {
    event.preventDefault()

    const recip = event.target.recip.value;

    sendHook.send(account, recip, modalTree.tokenId)

    // setSendSuccess(true);

  }

  //////////////////////////////
  // PAGE

  return <>
    <Frame title='Trees' accountRequired>
      <p>Cost to plant a new seed: {mintCost / 1e18} ETH</p>
      <TextButton onClick={() => doMint()}>Plant a new seed</TextButton>

      <ul role="list" className="my-8 max-w-4xl grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {myTrees && myTrees.map((tree) => (
          <li key={ 'tree' + tree.tokenId } className="relative">
            <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
              <img src={tree.image} alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
              <button type="button" className="absolute inset-0 focus:outline-none" onClick={() => openModal(tree)}>
                <span className="sr-only"></span>
              </button>
            </div>
            <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">Tree #{tree.tokenId} {tree.currentlyOwned && <span className="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded">Currently owned</span>}</p>
            {/* <p className="block text-sm font-medium text-gray-500 pointer-events-none">{tree.currentOwner.substring(0, 20)}...</p> */}
            <p className="block text-sm font-medium text-gray-500 pointer-events-none my-1">Rarity: {tree.rarity} <span className='mx-1'></span>Size: {tree.size}</p>
          </li>
        ))}
      </ul>

      {/* <p>{JSON.stringify(myTrees)}</p> */}
    </Frame>
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  {/* <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Payment successful
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
                      </p>
                    </div>
                  </div> */}
                  <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden">
                    <img src={modalTree && modalTree.image} alt="" className="object-cover pointer-events-none" />
                    <form onSubmit={waterTree} className='w-full flex flex-col items-center my-4'>
                      <TextInput name='amount' placeholder='Amount of ETH' />
                      <button type="submit" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">Water tree</button>
                      {/* {waterSuccess && <p className="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded">The tree has been watered, watch it grow!</p>} */}
                    </form>
                    <form onSubmit={sendTree} className='w-full flex flex-col items-center my-4'>
                      <TextInput name='recip' placeholder='Recipient address' />
                      <button type="submit" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">Send tree</button>
                      {/* {waterSuccess && <p className="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded">The tree has been watered, watch it grow!</p>} */}
                    </form>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Go back to dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
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
