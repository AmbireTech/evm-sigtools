const MESSAGE_TYPES = [
  {
    name: 'humanMessage',
    title: 'Human Message',
    tooltip: 'A human-like readable string message'
  },
  {
    name: 'hexMessage',
    title: 'Hexadecimal',
    tooltip: 'A hexadecimal encoded message'
  },
  {
    name: 'typedData',
    title: 'Typed Data',
    tooltip: 'An EIP-712 JSON like object'
  },
  {
    name: 'finalDigest',
    title: 'Final digest',
    tooltip: 'A 32 bytes long hexadecimal hash'
  }
]

export default MESSAGE_TYPES
