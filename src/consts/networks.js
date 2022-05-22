const NETWORKS = [
  {
    name: 'Ethereum',
    chainId: 1,
    rpc: 'https://main-light.eth.linkpool.io',
    token: 'ETH',
    icon: '/img/networks/ethereum.png'
  },
  {
    name: 'Polygon',
    chainId: 137,
    rpc: 'https://polygon-rpc.com',
    token: 'MATIC',
    icon: '/img/networks/polygon.png'
  },
  {
    name: 'Avalanche',
    chainId: 43114,
    token: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    icon: '/img/networks/avalanche.png'
  },
  {
    name: 'Binance Smart Chain',
    chainId: 56,
    token: 'BNB',
    rpc: 'https://bsc-dataseed1.defibit.io',
    icon: '/img/networks/bsc.png'
  },
  {
    name: 'Fantom',
    chainId: 250,
    token: 'FTM',
    rpc: 'https://rpc.ftm.tools',
    icon: '/img/networks/fantom.png'
  },
  {
    name: 'Moonbeam',
    chainId: 1284,
    token: 'GLMR',
    rpc: 'https://rpc.api.moonbeam.network',
    icon: '/img/networks/moonbeam.png'
  },
  {
    name: 'Moonriver',
    chainId: 1285,
    token: 'MOVR',
    rpc: 'https://rpc.api.moonriver.moonbeam.network',
    icon: '/img/networks/moonriver.png'
  },
  {
    name: 'Arbitrum',
    chainId: 42161,
    token: 'AETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    icon: '/img/networks/arbitrum.svg'
  },
  {
    name: 'Gnosis Chain',
    chainId: 100,
    token: 'XDAI',
    rpc: 'https://rpc.xdaichain.com',
    icon: '/img/networks/gnosis.png'
  },
  {
    name: 'Kucoin',
    chainId: 321,
    token: 'KCS',
    rpc: 'https://rpc-mainnet.kcc.network',
    icon: '/img/networks/kucoin.svg'
  },
  {
    name: 'Optimism',
    chainId: 10,
    token: 'ETH',
    rpc: 'https://mainnet.optimism.io',
    icon: '/img/networks/optimism.jpg'
  },
  {
    name: 'Andromeda',
    chainId: 1088,
    token: 'METIS',
    rpc: 'https://andromeda.metis.io/?owner=1088',
    icon: '/img/networks/andromeda.svg'
  },
  {
    name: 'Cronos',
    chainId: 25,
    token: 'CRO',
    rpc: 'https://evm-cronos.crypto.org',
    icon: '/img/networks/cronos.png'
  },
  {
    name: 'Aurora',
    chainId: 1313161554,
    token: 'NEAR Aurora',
    rpc: 'https://mainnet.aurora.dev',
    icon: '/img/networks/aurora.png'
  },
]

export default NETWORKS
