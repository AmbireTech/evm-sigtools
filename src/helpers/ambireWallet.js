import { createEIP1193Provider } from '@web3-onboard/common'

function ambireWallet(options) {
    const ambireSDK = options.sdk

    return () => {
        return {
            label: 'Ambire Wallet',
            getIcon: () => Promise.resolve(''),
            getInterface: async ({chains, EventEmitter}) => {
                const accounts = []

                const provider = createEIP1193Provider({
                    on: (event, listener) => {
                        console.log(`ambireWallet module event: ${event}`)
                        listener()
                    },
                    request: (method = 'eth_accounts') => {
                        console.log(`ambireWallet module request method: ${JSON.stringify(method)}`)
                        return []
                    },
                }, {
                    // eth_requestAccounts: () => Promise.resolve(accounts)
                })

                provider.on('connect', () => {
                    ambireSDK.openLogin()
                })
                provider.on('accountsChanged', () => {
                    //
                })
                provider.on('chainChanged', () => {
                    //
                })
                
                return {
                    provider
                }
            },
            platforms: ['all']
        }
    }
}

export default ambireWallet
