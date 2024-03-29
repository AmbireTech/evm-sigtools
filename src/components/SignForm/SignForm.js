import MESSAGE_TYPES from '../../consts/messageTypes'

import Tippy from '@tippyjs/react'

import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'

import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { TiWarningOutline } from 'react-icons/ti'
import { CgSpinnerTwoAlt } from 'react-icons/cg'
import { FaDice, FaInfo } from 'react-icons/fa'

import { arrayify, hexlify } from 'ethers/lib/utils'

import CopyButton from '../CopyButton/CopyButton.js'
import { getMessagePlaceholder, validateMessage } from '../../helpers/messages'

import './SignForm.scss'
import { MdIosShare } from 'react-icons/md'
import { useWeb3Onboard } from '@web3-onboard/react/dist/context'

const truncateAddress = (addr) => {
  return addr.substr(0, 4) + '...' + addr.substr(-4)
}

let provider

const SignForm = ({ selectedForm, setShareModalLink }) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ connectedChain }] = useSetChain()

  const connectedWallets = useWallets()
  const [connectedAccount, setConnectedAccount] = useState(null)
  const { state } = useWeb3Onboard()

  const [error, setError] = useState(null)

  const [isSigning, setIsSigning] = useState(false)
  const [isLoaderDelayerActive, setIsLoaderDelayerActive] = useState(false)
  const [signature, setSignature] = useState(null)
  const [hasDisconnected, setHasDiconnected] = useState(false)

  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState(null)

  const [selectedMessageType, setSelectedMessageType] = useState(MESSAGE_TYPES[0].name)

  const [roll712, setRoll712] = useState(false)

  // update errors on message change
  const onMessageChange = useCallback(
    (val) => {
      setMessage(val)
      setMessageError(null)

      if (!val) return true

      const error = validateMessage(val, selectedMessageType)
      if (error) {
        setMessageError(error)
      }
      return true
    },
    [selectedMessageType]
  )

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null

      const currentState = state.get()

      // If the user has disconnected from safe once we should not autoconnect him again
      if (selectedForm !== 'sign' || hasDisconnected || !currentState) return

      const availableWalletLabels = currentState.walletModules.map((module) => module.label)

      // Check if Safe is available, because autoselecting will fail if it's not
      if (!availableWalletLabels.includes('Safe')) return

      connect({
        autoSelect: {
          label: 'Safe',
        },
      })
    } else {
      provider = new ethers.providers.Web3Provider(wallet.provider, 'any')
    }
  }, [wallet, connect, selectedForm, hasDisconnected, state])

  // wallet sign call
  const walletSign = useCallback(
    async (message, messageType) => {
      if (!wallet) {
        setError('No wallet connected')
        return
      }

      if (provider) {
        const signer = provider.getUncheckedSigner()

        if (messageType === 'humanMessage') {
          if (wallet.label === 'Safe') {
            return (await wallet.instance.txs.signMessage(hexlify(ethers.utils.toUtf8Bytes(message)))).safeTxHash
          }
          return signer.signMessage(message)
        } else if (messageType === 'hexMessage') {
          if (wallet.label === 'Safe') {
            return (await wallet.instance.txs.signMessage(message)).safeTxHash
          }
          return signer.signMessage(arrayify(message))
        } else if (messageType === 'typedData') {
          if (wallet.label === 'Safe') {
            try {
              const { safeTxHash } = await wallet.instance.txs.signTypedMessage(JSON.parse(message))

              return safeTxHash
            } catch {
              setError('Sign error: Unable to sign typed data')
            }
          } else {
            const parsedMessage = JSON.parse(message)
            return signer._signTypedData(parsedMessage.domain, parsedMessage.types, parsedMessage.message)
          }
        }
      } else {
        setError('Provider not found')
      }
    },
    [wallet]
  )

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
      .catch((e) => {
        if (e.message.startsWith('Provided chainId')) {
          setError('Sign error: Please connect your signer wallet to the chain provided by the signature. ' + e.message)
        } else {
          setError('Sign error: ' + e.message)
        }

        setIsSigning(false)
      })
      .then((signature) => {
        setSignature(signature)
        setIsSigning(false)
      })
  }, [isLoaderDelayerActive, isSigning, message, selectedMessageType, walletSign])

  const generate712Message = useCallback(() => {
    setRoll712(true)
    setTimeout(() => setRoll712(false), 350)

    const JSON712TypedMessages = [
      {
        domain: {
          name: 'Ambire Wallet News',
          chainId: 1,
        },
        types: {
          article: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'publisher', type: 'address' },
            { name: 'rating', type: 'uint256' },
          ],
        },
        primaryType: 'article',
        message: {
          title: 'Example of eip-712 typed data message',
          description:
            'Tip: When chainId is specified in the domain, you should select the appropriate network in your wallet',
          publisher: '0x942f9CE5D9a33a82F88D233AEb3292E680230348',
          rating: '5',
        },
      },

      // USDC permit example
      {
        domain: {
          name: 'USD Coin',
          chainId: 1,
          verifyingContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          version: '2',
        },
        types: {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        message: {
          owner: connectedAccount.address,
          spender: '0x0000000000000000000000000000000000000000',
          value: '133700',
          nonce: '0',
          deadline: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        },
      },

      // Snapshot 712 example
      {
        domain: {
          name: 'snapshot',
          version: '0.1.4',
        },
        types: {
          Alias: [
            { name: 'from', type: 'address' },
            { name: 'alias', type: 'address' },
          ],
        },
        primaryType: 'Alias',
        message: {
          from: connectedAccount.address,
          alias: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        },
      },
    ]

    const filtered = JSON712TypedMessages.filter((m) => JSON.stringify(m, ' ', ' ') !== message) // skip redundant
    const randomMessage = filtered[Math.round(Math.random() * (filtered.length - 1))]
    const msg = JSON.stringify(randomMessage, ' ', ' ')
    setMessage(msg)
  }, [connectedAccount, message])

  const onShare = useCallback(() => {
    const host = window.location.host
    const path = window.location.pathname
    const protocol = window.location.protocol

    const toBinary = (string) => {
      const codeUnits = new Uint16Array(string.length)
      for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i)
      }
      const charCodes = new Uint8Array(codeUnits.buffer)
      let result = ''
      for (let i = 0; i < charCodes.byteLength; i++) {
        result += String.fromCharCode(charCodes[i])
      }
      return result
    }

    const b64 = btoa(
      toBinary(
        JSON.stringify({
          signer: connectedAccount.address,
          message,
          signature,
          chainId: ethers.BigNumber.from(connectedChain.id).toNumber(),
          messageType: selectedMessageType,
        })
      )
    )

    setShareModalLink(`${protocol}//${host}${path}?verify=${b64}`)
  }, [connectedAccount, connectedChain, message, setShareModalLink, signature, selectedMessageType])

  // only filter 1 main account
  useEffect(() => {
    if (connecting) return

    if (!connectedWallets || connectedWallets.length === 0) {
      setConnectedAccount(null)
      return
    }
    const firstWallet = connectedWallets[0]
    setConnectedAccount(firstWallet?.accounts[0])
  }, [connectedWallets, connecting])

  useEffect(() => {
    setSignature(null)
  }, [message, selectedMessageType])

  useEffect(() => {
    onMessageChange(message)
  }, [message, onMessageChange, selectedMessageType])

  // hack to access onboard css non exposed css properties
  useEffect(() => {
    if (connecting) {
      if (document.getElementsByTagName('onboard-v2').length) {
        const onboardContainer = document.getElementsByTagName('onboard-v2')[0]
        let style = document.createElement('style')
        style.innerHTML =
          '.wallet-button-styling .border-blue.background-transparent { background-color: var(--onboard-wallet-app-icon-background-color); }'
        onboardContainer.shadowRoot.appendChild(style)
      }
    }
  }, [connecting])

  if (selectedForm !== 'sign') return <></>

  return (
    <div className='signForm'>
      <div className='instructions'>
        <span className='instructions-icon'>
          <FaInfo />
        </span>
        <span className='instructions-text'>
          Use this tool to sign Ethereum messages with your wallet.
          <br />
          Supported formats: human-like, hexadecimal and typed messages
        </span>
      </div>

      {error && !isLoaderDelayerActive && (
        <div className='notification danger mainError' id='error'>
          {error}
        </div>
      )}

      <div className='connectedBar'>
        {connectedAccount ? (
          <>
            <span>
              Connected with <b>{truncateAddress(connectedAccount.address)}</b>
              <CopyButton textToCopy={connectedAccount.address} />
            </span>
            <button
              onClick={() => {
                disconnect(wallet)
                setHasDiconnected(true)
              }}
              className='button-disconnect'
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <div className='signFormConnect'>
            <div className='signFormConnect-text'>In order to sign messages, you need to be connected to a wallet</div>
            <button onClick={() => connect()} className='button-connect'>
              {connecting ? 'connecting' : 'connect wallet'}
            </button>
          </div>
        )}
      </div>
      {connectedAccount && (
        <div>
          <div className='formInputBlock'>
            <div className='messageInputContainer'>
              <div className='messageInputHeader'>
                {MESSAGE_TYPES.filter((m) => m.name !== 'finalDigest').map((m) => (
                  <Tippy content={m.tooltip} className={'info top'} key={m.name}>
                    <a
                      key={m.name}
                      className={m.name === selectedMessageType ? 'selected' : ''}
                      onClick={() => setSelectedMessageType(m.name)}
                    >
                      {m.title}
                    </a>
                  </Tippy>
                ))}
                {(selectedMessageType === 'typedData' || messageError) && (
                  <span className='messageInputHeader-spacer' />
                )}

                {selectedMessageType === 'typedData' && (
                  <>
                    <Tippy content='Click here to randomize a 712 message' placement={'left'} className={'info left'}>
                      <span
                        className={`messageInputHeader-icon info diceRoller ${roll712 ? 'rolling' : ''}`}
                        onClick={generate712Message}
                      >
                        <FaDice />
                      </span>
                    </Tippy>
                  </>
                )}
                {messageError && (
                  <>
                    <Tippy content={messageError} placement={'left'} className={'danger left'}>
                      <span className='messageInputHeader-icon danger'>
                        <TiWarningOutline />
                      </span>
                    </Tippy>
                  </>
                )}
              </div>
              <textarea
                className='formInput formInput-message'
                placeholder={getMessagePlaceholder(selectedMessageType)}
                value={message}
                onChange={(e) => onMessageChange(e.currentTarget?.value)}
                spellCheck={false}
              />
            </div>
          </div>
          {signature && (
            <>
              <div className='notification success'>
                <div className='verifyFeedback'>
                  <div className='signatureResult-title'>
                    Message signature
                    <div className='signatureResult-actions'>
                      <div className='copyHolder'>
                        <CopyButton textToCopy={signature} feedbackPlacement={'left'} title='Copy' />
                      </div>
                      <div className='shareHolder' onClick={onShare}>
                        <span className='actionIcon'>
                          <MdIosShare />
                        </span>
                        <span className='actionTitle'>Share</span>
                      </div>
                    </div>
                  </div>
                  <span className='signatureResult-signature'>{signature}</span>
                </div>
              </div>
            </>
          )}
          <div className='actionContainer'>
            <button className={isSigning || isLoaderDelayerActive ? 'loading' : ''} onClick={sign}>
              {isSigning || isLoaderDelayerActive ? <CgSpinnerTwoAlt className='spin' /> : <span>Sign</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignForm
