import NETWORKS from './consts/networks.js'
import { ethers } from 'ethers'

import { init } from '@web3-onboard/react'
import walletConnectModule from '@web3-onboard/walletconnect'
import ledgerModule from '@web3-onboard/ledger'
import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import gnosisModule from '@web3-onboard/gnosis'
const WC_PROJECT_ID = 'd98522bddb36e73acae903da02b45fd1'

const walletConnect = walletConnectModule({
  projectId: WC_PROJECT_ID,
  requiredChains: [],
  additionalRequiredMethods: ['eth_signTypedData_v4'],
  optionalChains: NETWORKS.map((n) => n.chainId),
  dappUrl: 'https://sigtool.ambire.com/',
})

const injected = injectedModule()
const ledger = ledgerModule({
  projectId: WC_PROJECT_ID,
})
const trezor = trezorModule({
  appUrl: 'https://sigtool.ambire.com/',
  email: 'contactus@ambire.com',
})
const gnosis = gnosisModule({ whitelistedDomains: [/./] })

export default init({
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  wallets: [injected, walletConnect, trezor, ledger, gnosis],
  chains: NETWORKS.map((n) => ({
    id: ethers.utils.hexValue(n.chainId),
    label: n.name,
    rpcUrl: n.rpc,
    token: n.token,
  })),
  appMetadata: {
    name: 'Signature Validator',
    icon: process.env.REACT_APP_SUBFOLDER_PATH + '/img/signature-validator-logo.png',
    description: 'Signature Validator tool',
    recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
  },
})
