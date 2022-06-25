import { useEtherBalance, useEthers } from '@usedapp/core'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { formatEther } from '@ethersproject/units'
import { TextButton } from '../components/examples/misc.js'

export default function Home() {
  const { activateBrowserWallet, account } = useEthers()
  const etherBalance = useEtherBalance(account)

  const connectWithWalletConnect = async () => {
    const provider = new WalletConnectProvider({
      // infuraId: SOME_LONG_API_ID,
      rpc: {
        288: "https://mainnet.boba.network/",
      },
    });
    await provider.enable();
    activateBrowserWallet(provider);
  }

  return (
    <div>
      <div>
        <TextButton onClick={() => activateBrowserWallet()}>Connect with MetaMask</TextButton>
        <TextButton onClick={() => connectWithWalletConnect()}>Connect with WalletConnect</TextButton>
      </div>
      {account && <p>Account: {account}</p>}
      {etherBalance && <p>Balance: {formatEther(etherBalance)}</p>}
    </div>
  )
}
