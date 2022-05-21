import NETWORKS from '../../consts/networks.js'
import MESSAGE_TYPES from '../../consts/messageTypes'

import CopyButton from '../CopyButton/CopyButton.js'
import { getMessagePlaceholder, validateMessage } from '../../helpers/messages'

import { init, useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import walletConnectModule from '@web3-onboard/walletconnect'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { TiWarningOutline } from 'react-icons/ti'
import { CgSpinnerTwoAlt } from 'react-icons/cg'

import './SignForm.scss'
import { arrayify } from 'ethers/lib/utils'

const walletConnect = walletConnectModule()
const injected = injectedModule()
const webOnboard = init({
  wallets: [injected, walletConnect],
  chains: NETWORKS.map(n => ({
    id: ethers.utils.hexValue(n.chainId),
    label: n.name,
    rpcUrl: n.rpc,
    token: n.token
  })),
  appMetadata: {
    name: 'Signature Validator',
    icon: '/img/signature-validator-logo.png',
    description: 'Signature Validator tool',
    recommendedInjectedWallets: [{name: 'MetaMask', url: 'https://metamask.io'}]
  },
  accountCenter: {
    desktop: {
      enabled: false
    }
  }
})

const truncateAddress = (addr) => {
  return addr.substr(0, 4) + '...' + addr.substr(-4)
}

const SignForm = ({selectedForm}) => {

  const [{wallet, connecting}, connect, disconnect] = useConnectWallet()
  // maybe later
  //const [{chains, connectedChain, settingChain}, setChain] = useSetChain()
  const connectedWallets = useWallets()
  const [connectedAccount, setConnectedAccount] = useState(null)

  const [error, setError] = useState(null)

  const [isSigning, setIsSigning] = useState(false)
  const [isLoaderDelayerActive, setIsLoaderDelayerActive] = useState(false)
  const [signature, setSignature] = useState(null)

  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState(null)

  const [selectedMessageType, setSelectedMessageType] = useState(MESSAGE_TYPES[0].name)

  // update errors on message change
  const onMessageChange = useCallback((val) => {
    setMessage(val)
    setMessageError(null)

    if (val === '') return true

    const error = validateMessage(val, selectedMessageType)
    if (error) {
      setMessageError(error)
    }
    return true
  }, [selectedMessageType])

  // wallet sign call
  const walletSign = useCallback((message, messageType) => {
    if (!wallet) {
      setError('No wallet connected')
      return
    }

    if (wallet.provider) {
      const provider = new ethers.providers.Web3Provider(wallet.provider, 'any')
      const signer = provider.getUncheckedSigner()

      if (messageType === 'humanMessage') {
        return signer.signMessage(message)
      } else if (messageType === 'hexMessage') {
        return signer.signMessage(arrayify(message))
      } else if (messageType === 'typedData') {
        if (wallet.label === 'WalletConnect') {
          return wallet.provider.connector.signTypedData([connectedAccount.address, message])
        } else {
          const parsedMessage = JSON.parse(message)
          return signer._signTypedData(
            parsedMessage.domain,
            parsedMessage.types,
            parsedMessage.message
          )
        }
      }
    } else {
      setError('Provider not found')
    }
  }, [wallet, connectedAccount])

  // sign action
  const sign = useCallback(() => {
    if (isSigning || isLoaderDelayerActive) return
    // for UI feedback
    setIsLoaderDelayerActive(true)
    setTimeout(() => setIsLoaderDelayerActive(false), 250)

    const messageError = validateMessage(message, selectedMessageType)

    if (messageError) {
      setError(messageError)
      setMessageError(messageError)
      return false
    }

    setError(null)
    setIsSigning(true)
    setSignature(null)

    walletSign(message, selectedMessageType)
      .catch(e => {
        setError('Sign error: ' + e.message)
        setIsSigning(false)
      })
      .then(signature => {
        setSignature(signature)
        setIsSigning(false)
      })
  }, [isLoaderDelayerActive, isSigning, message, selectedMessageType, walletSign])

  // only filter 1 main account
  useEffect(() => {
    if (!connectedWallets || connectedWallets.length === 0) {
      setConnectedAccount(null)
      return
    }
    const firstWallet = connectedWallets[0]
    setConnectedAccount(firstWallet?.accounts[0])
  }, [connectedWallets])

  useEffect(() => {
    setSignature(null)
  }, [message, selectedMessageType])

  useEffect(() => {
    onMessageChange(message)
  }, [message, onMessageChange, selectedMessageType])

  if (selectedForm !== 'sign') return (<></>)

  return (
    <div className='signForm'>
      {
        (error && !isLoaderDelayerActive) &&
        <div className='notification danger mainError' id='error'>
          {error}
        </div>
      }

      {
        !connectedAccount &&
        <div className='signIntroText'>In order to sign messages, you need to be connected to a wallet</div>
      }

      <div className='connectedBar'>
        {
          connectedAccount
            ? (
              <>
                <span>
                  Connected with <b>{truncateAddress(connectedAccount.address)}</b> <CopyButton textToCopy={connectedAccount.address} />
                </span>
                <button onClick={() => disconnect(wallet)} className='button-disconnect'>
                  Disconnect Wallet
                </button>

              </>
            )
            : (
                <button onClick={() => connect()} className='button-connect'>
                  {connecting ? 'connecting' : 'connect wallet'}
                </button>
            )
        }
      </div>
      {
        connectedAccount &&
        <div>
          <div className='formInputBlock'>
            <div className='messageInputContainer'>
              <div className='messageInputHeader'>
                {
                  MESSAGE_TYPES.filter(m => m.name !== 'finalDigest').map(m =>
                    (
                      <Tippy content={m.tooltip} className={'info'} key={m.name}>
                        <a
                          key={m.name}
                          href={'#dummyTodo'}
                          className={m.name === selectedMessageType ? 'selected' : ''}
                          onClick={() => setSelectedMessageType(m.name)}
                        >{m.title}</a>
                      </Tippy>
                    )
                  )
                }
                {
                  messageError &&
                  <>
                    <span className='errorIndicatorSpacer'/>
                    <Tippy content={messageError} placement={'left'} className={'danger'}>
                      <span className='errorIndicator'><TiWarningOutline/></span>
                    </Tippy>
                  </>
                }
              </div>
              <textarea className='formInput formInput-message'
                        placeholder={getMessagePlaceholder(selectedMessageType)}
                        value={message}
                        onChange={(e) => onMessageChange(e.currentTarget?.value)}
                        spellCheck={false}/>
            </div>
          </div>
          {
            signature &&
            <>
              <div className='notification success'>
                <div className='verifyFeedback'>
                  <div className='signatureResult-title'>
                    Message signature
                    <div className='copyHolder'>
                      <CopyButton textToCopy={signature} feedbackPlacement={'left'} />
                    </div>
                  </div>

                  <span className='signatureResult-signature'>
                {signature}
              </span>
                </div>
              </div>
            </>
          }
          <div className='actionContainer'>
            <button
              className={(isSigning || isLoaderDelayerActive) ? 'loading' : ''}
              onClick={sign}>{(isSigning || isLoaderDelayerActive) ? <CgSpinnerTwoAlt className='spin'/> : (
              <span>Sign</span>)}</button>
          </div>
        </div>
      }
    </div>
  )
}

export default SignForm
