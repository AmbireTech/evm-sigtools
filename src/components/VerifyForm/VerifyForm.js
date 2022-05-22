import NETWORKS from '../../consts/networks.js'
import MESSAGE_TYPES from '../../consts/messageTypes.js'
import DropDown from '../../components/DropDown/DropDown'
import { useCallback, useEffect, useState } from 'react'
import { verifyMessage } from '@ambire/signature-validator'
import { ethers, providers } from 'ethers'
import { FaCheck, FaTimes } from 'react-icons/fa'
import './VerifyForm.scss'
import { CgSpinnerTwoAlt } from 'react-icons/cg'
import { scroller } from 'react-scroll'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { getMessagePlaceholder, validateMessage } from '../../helpers/messages'

import { TiWarningOutline } from 'react-icons/ti'

const VerifyForm = ({selectedForm}) => {

  const [error, setError] = useState(null)
  const [signerError, setSignerError] = useState(null)
  const [signatureError, setSignatureError] = useState(null)
  const [messageError, setMessageError] = useState(null)

  const [signer, setSigner] = useState('')
  const [signature, setSignature] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoaderDelayerActive, setIsLoaderDelayerActive] = useState(false)

  const [isValid, setIsValid] = useState(null)

  const [selectedMessageType, setSelectedMessageType] = useState(MESSAGE_TYPES[0].name)

  const [message, setMessage] = useState('')

  const [selectedNetwork, setSelectedNetwork] = useState(1)

  // Form signer validation
  const validateSigner = (signerAddr) => {
    if (!ethers.utils.isAddress(signerAddr)) {
      return 'Invalid signer address'
    }
  }
  const onSignerChange = useCallback((val) => {
    setSigner(val)
    setSignerError(null)
    if (!val) return

    const error = validateSigner(val)
    if (error) {
      setSignerError(error)
    }

  }, [])


  // Form signature validation
  const validateSignature = (signature) => {
    if (!ethers.utils.isHexString(signature)) {
      return 'Invalid signature format'
    }
  }
  const onSignatureChange = useCallback((val) => {
    setSignature(val)
    setSignatureError(null)

    if (!val) return

    const error = validateSignature(val)
    if (error) {
      setSignatureError(error)
    }
  }, [])

  // Form signature validation
  const onMessageChange = useCallback((val) => {
    setMessage(val)
    setMessageError(null)

    if (!val) return true

    const error = validateMessage(val, selectedMessageType)
    if (error) {
      setMessageError(error)
    }
    return true
  }, [selectedMessageType])

  // Verify action
  const verify = useCallback(() => {
    if (isVerifying || isLoaderDelayerActive) return
    setIsLoaderDelayerActive(true)
    setTimeout(() => setIsLoaderDelayerActive(false), 250)

    const signerError = validateSigner(signer)
    const signatureError = validateSignature(signature)
    const messageError = validateMessage(message, selectedMessageType)

    if (signerError) setSignerError(signerError)
    if (signatureError) setSignatureError(signatureError)
    if (messageError) setMessageError(messageError)

    if (signerError || signatureError || messageError) {
      setError('Some inputs are incorrect')
      return false
    }

    setError(null)
    setIsVerifying(true)
    setIsValid(null)

    const selectedNetworkData = NETWORKS.find(n => n.chainId === selectedNetwork)
    const provider = selectedNetworkData ? new providers.JsonRpcProvider(selectedNetworkData.rpc) : null

    verifyMessage({
      provider,
      signer,
      signature,
      message: selectedMessageType === 'hexMessage' ? ethers.utils.arrayify(message) : (selectedMessageType === 'typedData' ? null : message),
      typedData: selectedMessageType === 'typedData' ? JSON.parse(message) : null
    }).then(isValid => {
      setIsValid(isValid)
      setIsVerifying(false)
    }).catch(e => {
      setError('Verification Error: ' + e.message)
      setIsVerifying(false)
    })
  }, [isLoaderDelayerActive, isVerifying, message, selectedMessageType, selectedNetwork, signature, signer])

  // "real time" message validation
  useEffect(() => {
    onMessageChange(message)
  }, [message, onMessageChange, selectedMessageType])

  // remove validation OK message
  useEffect(() => {
    setIsValid(null)
  }, [signer, signature, message, selectedMessageType, selectedNetwork])

  // scroll to error
  useEffect(() => {
    if (error && !isLoaderDelayerActive) {
      scroller.scrollTo('error', {
        delay: 0,
        offset: -16,
        duration: 250,
        smooth: 'easeInOutQuart'
      })
    }
  }, [error, isLoaderDelayerActive])

  if (selectedForm !== 'verify') return (<></>)

  return (<div className='verifyForm'>

    {
      (error && !isLoaderDelayerActive) &&
      <div className='notification danger' id='error'>
        {error}
      </div>
    }

    <div className='formInputBlock'>
      <div className='messageInputContainer'>
        <div className='messageInputHeader'>
          <Tippy content='The address that signed the message'
                 placement={'top'}
                 className={'info top'}>
            <a
              href={'#dummyTodo'}
              className={'selected'}
            >Signer</a>
          </Tippy>
          {
            signerError &&
            <>
              <span className='messageInputHeader-spacer'/>
              <Tippy content={signerError}
                     placement={'left'}
                     className={'danger left'} >
                <span className='messageInputHeader-icon danger'><TiWarningOutline/></span>
              </Tippy>
            </>
          }
        </div>
        <textarea className='formInput formInput-signer'
                  placeholder='Signer address (0x....)'
                  value={signer}
                  onChange={(e) => onSignerChange(e.currentTarget?.value)}
                  spellCheck={false}/>
      </div>
    </div>

    <div className='formInputBlock'>
      <div className='messageInputContainer'>
        <div className='messageInputHeader'>
          {
            MESSAGE_TYPES.map(m =>
              (
                <Tippy content={m.tooltip}
                       className={'info top'}
                       key={m.name}>
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
              <span className='messageInputHeader-spacer'/>
              <Tippy
                content={messageError}
                placement={'left'}
                className={'danger left'} >
                <span className='messageInputHeader-icon danger'><TiWarningOutline/></span>
              </Tippy>
            </>
          }
        </div>
        <textarea className='formInput formInput-message'
                  placeholder={getMessagePlaceholder(selectedMessageType)}
                  value={message}
                  onChange={(e) => onMessageChange(e.currentTarget?.value)} spellCheck={false}/>
      </div>
    </div>

    <div className='formInputBlock'>
      <div className='messageInputContainer'>
        <div className='messageInputHeader'>
          <Tippy content='The signature to verify'
                 placement={'top'}
                 className={'info top'}>
            <a
              href={'#dummyTodo'}
              className={'selected'}
            >Signature</a>
          </Tippy>
          {
            signatureError &&
            <>
              <span className='messageInputHeader-spacer'/>
              <Tippy content={signatureError}
                     placement={'left'}
                     className={'danger left'}>
                <span className='messageInputHeader-icon danger'><TiWarningOutline/></span>
              </Tippy>
            </>
          }
        </div>
        <textarea className='formInput formInput-signature'
                  placeholder='Hexadecimal signature (0x....)'
                  value={signature}
                  onChange={(e) => onSignatureChange(e.currentTarget?.value)}
                  spellCheck={false}/>
      </div>
    </div>

    <div className='formInputBlock'>
      <DropDown id='dd-networks'
                title={selectedNetwork ? ('EIP-1271 Network: ' + NETWORKS.find(n => n.chainId === selectedNetwork).name) : 'Network (for EIP-1271 checks)'}
                closeOnClick={true}
                onOpen={() => {
                  //return false
                }}
      >
        {NETWORKS.sort((a, b) => a.chainId === 1 ? -1 : a.name.localeCompare(b.name)).map(n => (
          <div key={n.chainId}
               className='menu-item'
               onClick={() => {
                 setSelectedNetwork(n.chainId)
               }}>
            <span className='networkIcon'><img src={`${process.env.REACT_APP_SUBFOLDER_PATH}${n.icon}`} alt={n.name} /></span>
            <span className='networkName'>{n.name}</span>
          </div>
        ))}
      </DropDown>
    </div>

    {
      isValid !== null &&
      <div className={`notification ${isValid ? 'success' : 'danger'}`}>
        <div className='verifyFeedback'>
          <div className='verifyFeedback-icon'>
            {
              isValid ? <FaCheck/> : <FaTimes/>
            }
          </div>
          <span className='verifyFeedback-text'>
            Signature is {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>
    }

    <div className='actionContainer'>
      <button
        className={(isVerifying || isLoaderDelayerActive) ? 'loading' : ''}
        onClick={verify}>{(isVerifying || isLoaderDelayerActive) ? <CgSpinnerTwoAlt className='spin'/> : (
        <span>Verify</span>)}</button>
    </div>
  </div>)
}

export default VerifyForm
