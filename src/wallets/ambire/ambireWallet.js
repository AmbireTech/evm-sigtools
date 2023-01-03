import { createEIP1193Provider } from '@web3-onboard/common'

function ambireWallet() {
    const ambireSDK = new window.AmbireSDK({
        walletUrl: 'http://localhost:3000',
        dappName: 'sign-tool-dapp',
        chainID: 1,
        iframeElementId: 'ambire-sdk-iframe',
    })

    let connectedAccounts = []
    let connectedchain = '0x1'

    const handleLogin = async () => {
        ambireSDK.openLogin({chainId: parseInt(connectedchain)})

        return new Promise((resolve, reject) => {
            ambireSDK.onLoginSuccess((data) => {
                connectedAccounts = [data.address]
                connectedchain = `0x${parseInt(connectedchain).toString(16)}`
                resolve(connectedAccounts)
            })
        })
    }

    return () => {
        return {
            label: 'Ambire Wallet',
            getIcon: async () => (await import('./ambireLogoMini.png')).default,
            getInterface: async ({chains, EventEmitter}) => {
                const emitter = new EventEmitter()

                const provider = createEIP1193Provider({
                    on: emitter.on.bind(emitter),
                }, {
                    eth_requestAccounts: async () => {
                        if (connectedAccounts.length > 0) {
                            return Promise.resolve(connectedAccounts)
                        }

                        return handleLogin()
                    },
                    eth_selectAccounts: async () => {
                        if (connectedAccounts.length > 0) {
                            return Promise.resolve(connectedAccounts)
                        }

                        return handleLogin()
                    },
                    eth_accounts: async () => {
                        return Promise.resolve(connectedAccounts)
                    },
                    eth_chainId: async () => {
                        return Promise.resolve(connectedchain)
                    },
                    personal_sign: async ({ params: [message, address] }) => {
                        ambireSDK.openSignMessage('personal_sign', message)

                        return new Promise((resolve, reject) => {
                            ambireSDK.onMsgSigned((data) => {
                                // TODO: return message signature here
                                return resolve()
                            })
                            ambireSDK.onMsgRejected(() => {
                                reject({ code: 4001, message: 'User rejected the request.' })
                            })
                        })
                    },
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
