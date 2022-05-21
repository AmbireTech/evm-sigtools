import { useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import { MdContentCopy } from 'react-icons/md'
import { useCallback } from 'react'

import './CopyButton.scss'

export default function CopyButton({
                                     textToCopy,
                                     feedbackPlacement = 'right'
                                   }) {

  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [showCopyButton, setShowCopyButton] = useState(true)

  const copyButtonRef = useRef()
  const copyFeedbackRef = useRef()

  // Would like to know what would be the best practice to get this effect, with the least code possible, and if possible with only 1 boolean state
  const copyToClipboard = useCallback(() => {
    setShowCopyButton(false)
    navigator.clipboard.writeText(textToCopy)

    setTimeout(() => {
      setShowCopyFeedback(true)
    }, 100)
    setTimeout(() => {
      setShowCopyFeedback(false)
    }, 750)
  }, [textToCopy])

  return (
    <div className='copyButton'>
      <CSSTransition in={showCopyFeedback}
                     timeout={250}
                     classNames='copy-transition'
                     onExited={() => setShowCopyButton(true)}
                     unmountOnExit
                     nodeRef={copyFeedbackRef}
      >
        <span className={`copyButton-feedback copyButton-placement-${feedbackPlacement}`}
              ref={copyFeedbackRef}>Copied</span>
      </CSSTransition>
      <CSSTransition in={showCopyButton}
                     timeout={250}
                     classNames='copy-transition'
                     unmountOnExit
                     nodeRef={copyButtonRef}
      >
        <span className='copyButton-icon' ref={copyButtonRef}><MdContentCopy onClick={copyToClipboard}/></span>
      </CSSTransition>
    </div>
  )

}
