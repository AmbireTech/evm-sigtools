import { ethers } from 'ethers'

const getMessagePlaceholder = (messageType) => {
  if (messageType === 'humanMessage') {
    return 'Message (Hello world)'
  } else if (messageType === 'hexMessage') {
    return 'Message (0x......)'
  } else if (messageType === 'typedData') {
    return `{
  domain : {},
  types: {},
  message: {}     
}`
  } else if (messageType === 'finalDigest') {
    return '0x...'
  }
}

const validateMessage = (message, messageType) => {
  if (messageType === 'hexMessage') {
    if (!ethers.utils.isHexString(message) || !(message.length % 2 === 0)) {
      return 'Invalid hexadecimal string'
    }
  } else if (messageType === 'typedData') {
    try {
      const parsedJSON = JSON.parse(message)
      if (!parsedJSON.domain) {
        return 'Missing domain property'
      }
      if (!parsedJSON.types) {
        return 'Missing types property'
      }
      if (!parsedJSON.message) {
        return 'Missing message property'
      }
      ethers.utils._TypedDataEncoder.hash(parsedJSON.domain, parsedJSON.types, parsedJSON.message)
    } catch (e) {
      return e.message
    }
  } else if (messageType === 'finalDigest') {
    if (!ethers.utils.isHexString(message)) {
      return 'Invalid hexadecimal string'
    }
    if (message.length !== 66) {
      return 'Invalid hexadecimal length. 32 expected'
    }
  }
}

export { getMessagePlaceholder, validateMessage }
