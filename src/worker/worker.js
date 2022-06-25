import { getWorker } from "../lib/bullmq.js";
import getMongo from "../lib/mongo.js";
import { rpcUrl, chainId, address, abi } from '../lib/contract.js'
import Web3 from 'web3'
// import pkg from '../lib/contract.js';
// const { rpc, chainId, address, abi } = pkg;

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

    const ownerHistory = JSON.stringify(event.returnValues.owners);
    const ownerHistoryHash = hash(ownerHistory);

    const updateRes = await db.collection('trees').updateOne(
      { tokenId: tokenId },
      { $set: { rarity: rarity, size: size, owners: owners, currentOwner: owners[owners.length - 1], ownerHistoryHash: ownerHistoryHash, ownerHistoryHashHex: ownerHistoryHash.toString(16) } },
      { upsert: true },
    )
    console.log(updateRes);
  }
}

checkForNewEvents()
setInterval(checkForNewEvents, 10000)
