import Frame from '../components/Frame.js';
import { TextButton } from '../components/examples/misc.js';
import { address, abi } from '../contract.js';
import { utils } from 'ethers'
import { Contract } from '@ethersproject/contracts'

const contract = new Contract(address, new utils.Interface(abi));

function useMintCost() {
  const { value, error } =
    useCall(
      {
        contract: contract,
        method: "getCurrentMintCost",
        args: [],
      }
    );
  if (error) {
    console.error(error.message)
    return undefined
  }
  return value?.[0]
}

export default function Trees() {
  const mintCost = useMintCost();

  return <>
    <Frame title='Trees' accountRequired>
      <p>Cost to plant a new seed: {mintCost}</p>
      <TextButton onClick={() => doMint()}>Plant a new seed</TextButton>

    </Frame>
  </>
}
