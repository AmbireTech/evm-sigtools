import SignForm from './components/SignForm/SignForm.js'
import VerifyForm from './components/VerifyForm/VerifyForm.js'
import './App.scss'
import { useCallback, useEffect, useState } from 'react'

const THEMES = [
  'theme1',
  'theme2',
  'theme3',
]

function App() {

  const [selectedForm, setSelectedForm] = useState('sign')

  const [theme, setTheme] = useState(0)

  const changeTheme = useCallback(() => {
    if (theme + 1 > THEMES.length - 1 ) {
      setTheme(0)
    } else {
      setTheme(theme + 1)
    }
  }, [theme])

  useEffect(() => {
    document.body.className = THEMES[theme]
  }, [theme])

  return (
    <div className='App'>
      <div className={'pageContainer'}>
        <div className={'mainContainer'}>
          <div className={'row'}>
            <div className={'containerTitle'}>
              <div className={'containerTitle-logo'}>
                <img src='/img/signature-validator-logo.png' alt=''/>
              </div>
              <div className={'containerTitle-text'}>
                <h1>EVM SIGTOOLS</h1>
                <div>Sign and verify regular, 721 and 1271 signatures</div>
              </div>
            </div>
            <div className='formSelector'>
              <a href={'#sign'} className={selectedForm === 'sign' ? 'selected' : ''} onClick={(e) => {
                setSelectedForm('sign')
                e.preventDefault()
              }}>Sign</a>
              <a href={'#verify'} className={selectedForm === 'verify' ? 'selected' : ''} onClick={(e) => {
                setSelectedForm('verify')
                e.preventDefault()
              }}>Verify</a>
            </div>
            <SignForm
              selectedForm={selectedForm}
            />
            <VerifyForm
              selectedForm={selectedForm}
            />
          </div>
        </div>
        <footer>
          <a href='https://wallet.ambire.com/' target='_blank' rel='noreferrer'><img src={'/img/ambireLogoMini.png'}
                                                                                     alt='ambire-logo'/>Powered by
            Ambire Wallet</a>
          <a href='https://github.com/AmbireTech/' target='_blank' rel='noreferrer'><img src={'/img/githubLogoMini.svg'}
                                                                                         alt='github-logo'/>@ambire/signature-validator</a>
          <a href={'#dummyTodo'} onClick={changeTheme}><img src={'/img/ambireLogoMini.png'}
                                                                                         alt='ambire-logo'/> Theme {theme + 1}</a>
        </footer>
      </div>
    </div>
  )
}

export default App
