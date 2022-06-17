import SignForm from './components/SignForm/SignForm.js'
import VerifyForm from './components/VerifyForm/VerifyForm.js'
import './App.scss'
import { useCallback, useEffect, useState } from 'react'
import { FaInfo, FaTimes } from 'react-icons/fa'
import CopyButton from './components/CopyButton/CopyButton.js'

const THEMES = ['theme1', 'theme2', 'theme3']

function App() {
  const [selectedForm, setSelectedForm] = useState('sign')

  const [shareModalLink, setShareModalLink] = useState(null)

  const [theme, setTheme] = useState(0)

  const changeTheme = useCallback(() => {
    if (theme + 1 > THEMES.length - 1) {
      setTheme(0)
    } else {
      setTheme(theme + 1)
    }
  }, [theme])

  const onOverlayClick = useCallback((e) => {
    if (e.target.className === 'overlay') {
      setShareModalLink(null)
    }
  }, [])

  useEffect(() => {
    document.body.className = THEMES[theme]
  }, [theme])

  useEffect(() => {
    const queryString = window.location.search
    if (queryString.startsWith('?verify=')) {
      setSelectedForm('verify')
    }
  }, [])

  return (
    <div className='App'>
      <div className={'pageContainer'}>
        <div className={'mainTitle'}>
          <div className={'mainTitle-logo'}>
            <img src='img/signature-validator-logo-flat.png' alt='' />
          </div>
          <div className={'mainTitle-text'}>
            <h1>
              EVM <span>SIGTOOLS</span>
            </h1>
            <div>Sign and verify regular, 721 and 1271 Ethereum signatures</div>
          </div>
        </div>
        <div className={'mainContainer'}>
          <div className={'row'}>
            <div className='formSelector'>
              <a
                href={'#sign'}
                className={selectedForm === 'sign' ? 'selected' : ''}
                onClick={(e) => {
                  setSelectedForm('sign')
                  e.preventDefault()
                }}
              >
                Sign
              </a>
              <a
                href={'#verify'}
                className={selectedForm === 'verify' ? 'selected' : ''}
                onClick={(e) => {
                  setSelectedForm('verify')
                  e.preventDefault()
                }}
              >
                Verify
              </a>
            </div>
            <SignForm selectedForm={selectedForm} setShareModalLink={setShareModalLink} />
            <VerifyForm selectedForm={selectedForm} />
          </div>
        </div>
        <footer>
          <a href='https://wallet.ambire.com/' target='_blank' rel='noreferrer'>
            <img src={'img/ambireLogoMini.png'} alt='ambire-logo' />
            Powered by Ambire Wallet
          </a>
          <a href='https://www.npmjs.com/package/@ambire/signature-validator' target='_blank' rel='noreferrer'>
            <img src={'img/npmLogoMini.svg'} alt='npm-logo' />
            @ambire/signature-validator
          </a>
          <a onClick={changeTheme}>
            <img src={'img/ambireLogoMini.png'} alt='ambire-logo' /> Theme {theme + 1}
          </a>
        </footer>
      </div>
      {shareModalLink && (
        <div id='shareModal'>
          <div className='overlay' onMouseDown={onOverlayClick}>
            <div className='modal'>
              <div className='modalHeader'>
                <span className='modalTitle'>Share this signature authenticity with this link</span>
                <span className='modalClose' onClick={() => setShareModalLink(null)}>
                  <FaTimes />
                </span>
              </div>
              <div className='modalLink'>
                <input type='text' className='formInput' value={shareModalLink} spellCheck='false' />
                <CopyButton title='Copy' textToCopy={shareModalLink} />
              </div>
              <div className='instructions'>
                <span className='instructions-icon'>
                  <FaInfo />
                </span>
                <span>
                  This link is not stored in our servers as it contains the data of the signer, the message and the
                  signature, to verify the message. <br />
                  This link is only meant to share the authenticity of an Ethereum message, not to share encrypted data
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
