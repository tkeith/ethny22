import { getWorker } from "../lib/bullmq.js";
import getMongo from "../lib/mongo.js";
import { rpcUrl, chainId, address, abi } from '../lib/contract.js'
import Web3 from 'web3'
import axios from 'axios'
import FormData from 'form-data'
import getConfig from "../lib/config.js";
// import pkg from '../lib/contract.js';
// const { rpc, chainId, address, abi } = pkg;
import fs from 'fs'

getWorker('exampleSaveTextQueue', async job => {
  const newText = job.data.newText;
  console.log('saving new text: ', newText);
  (await getMongo()).collection('example').updateOne(
    {},
    { $set: { text: newText } },
    { upsert: true, });
});

setInterval(() => {
  console.log('hello from worker')
}, 600000);


export const web3 = new Web3(rpcUrl);
export const myContract = new web3.eth.Contract(abi, address)

const hash = function (b) { for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0) };
const hashHex = function (b) { return hash(b).toString(16) };

async function checkForNewEvents() {
  console.log('getting db')
  const db = await getMongo()

  const scanOptions = {
    fromBlock: (await web3.eth.getBlockNumber()) - 50,
    toBlock: 'latest'
  }

  try {
    var events = await myContract.getPastEvents('TreeChange', scanOptions)
  } catch (err) {
    console.log('failed to get events')
    console.log(err)
    return
  }

  for (const event of events) {
    console.log(event)
    const tokenId = parseInt(event.returnValues.tokenId)
    const rarity = parseInt(event.returnValues.rarity)
    const size = parseInt(event.returnValues.size)
    console.log(event.returnValues.owners)
    const owners = []
    for (const item of event.returnValues.owners) {
      owners.push(item.owner)
    }

    const numOwners = owners.length;

    const ownerHistory = JSON.stringify(event.returnValues.owners);
    const ownerHistoryHash = hash(ownerHistory);
    const ownerHistoryHashHex = ownerHistoryHash.toString(16);

    const current = await db.collection('trees').findOne(
      { tokenId: tokenId }
    )
    if ((!current) || current.size < size || current.numOwners < numOwners) {
      // some change happened
      console.log('CHANGE, UPDATING')
      console.log(current)
      console.log({ size: size, numOwners: numOwners })

      const updateRes = await db.collection('trees').updateOne(
        { tokenId: tokenId },
        { $set: { rarity: rarity, size: size, owners: owners, numOwners: numOwners, currentOwner: owners[owners.length - 1], ownerHistoryHash: ownerHistoryHash, ownerHistoryHashHex: ownerHistoryHashHex } },
        { upsert: true },
      )
      console.log(updateRes);

      let image;
      if (rarity == 0) {
        image = "https://demo.storj-ipfs.com/ipfs/QmXv8Tbvm1hQmzWsSzsMCXGgK7g3tGfLhPWzJQKpodVU1t";
      } else {
        image = "https://demo.storj-ipfs.com/ipfs/QmcZTSMUMvFftMqqUBFy5jVyEXgAGmRSt2X8LqGLBc5QPU";
        // set image to pending image
      }
      const updateImageRes = await db.collection('trees').updateOne(
        { tokenId: tokenId },
        { $set: { image: image } },
        {},
      );
      console.log(updateImageRes);

      if (rarity > 0) {
        // if rarity is zero, it's still an acorn. only need to generate an image if > 0

        (async () => {
          var imageData;

          imageData = await generateImage({ tokenId, rarity, size, owners, ownerHistoryHash, ownerHistoryHashHex });

          if (imageData) {
            var formData = new FormData();
            formData.append("image", imageData);

            const newImageIpfsHash = (await axios.post('https://demo.storj-ipfs.com/api/v0/add', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })).data.Hash;

            const newImage = "https://demo.storj-ipfs.com/ipfs/" + newImageIpfsHash;

            const updateImageRes = await db.collection('trees').updateOne(
              { tokenId: tokenId },
              { $set: { image: newImage } },
              {},
            );


            try {
              const pkey = (await getConfig()).eth_private_key;
              console.log('private key: ', pkey);
              const account = web3.eth.accounts.privateKeyToAccount(pkey);
              console.log(account)

              var encodedABI = myContract.methods.setIpfsHash(tokenId, newImageIpfsHash).encodeABI()
              // setIpfsHash(uint256 tokenId, string calldata ipfsHash)

              var txn = {
                from: account.address,
                to: myContract.options.address,
                gas: 10000000,
                data: encodedABI,
              };
              console.log('txn: ', txn)

              var signed = await account.signTransaction(txn)
              console.log(signed)

              var sendRes = await web3.eth.sendSignedTransaction(signed.rawTransaction)

              console.log(sendRes)
            } catch (err) {
              console.log(err)
            }


          } else {
            console.log('ERROR GENERATING IMAGE DATA');
          }

        })();

      }
    }
  }
}

checkForNewEvents()
setInterval(checkForNewEvents, 10000)

async function generateImage({ tokenId, rarity, size, owners, ownerHistoryHash, ownerHistoryHashHex }) {

  const data = await fs.promises.readFile(`../tree-images/tree-${rarity}.gif`);
  return data

}
