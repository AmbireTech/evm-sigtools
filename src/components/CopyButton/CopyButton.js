import { useRef, useState, useCallback } from 'react'
import { CSSTransition } from 'react-transition-group'
import { MdContentCopy } from 'react-icons/md'

import './CopyButton.scss'

const CopyButton = ({ textToCopy, feedbackPlacement = 'right', title }) => {
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
    }, 250)
    setTimeout(() => {
      setShowCopyFeedback(false)
    }, 750)
  }, [textToCopy])

  return (
    <div className={`copyButton${title ? ' titled' : ''}`}>
      <CSSTransition
        in={showCopyFeedback}
        timeout={250}
        classNames='copy-transition'
        onExited={() => setShowCopyButton(true)}
        unmountOnExit
        nodeRef={copyFeedbackRef}
      >
        <span
          className={`copyButton-icon-holder copyButton-feedback copyButton-placement-${feedbackPlacement}`}
          ref={copyFeedbackRef}
        >
          {title && (
            <span className='actionIcon'>
              <MdContentCopy />
            </span>
          )}
          <span className='actionTitle'>Copied</span>
        </span>
      </CSSTransition>
      <CSSTransition
        in={showCopyButton}
        timeout={200}
        classNames='copy-transition'
        unmountOnExit
        nodeRef={copyButtonRef}
      >
        <span className='copyButton-icon-holder' ref={copyButtonRef} onClick={copyToClipboard}>
          <span className='actionIcon'>
            <MdContentCopy />
          </span>
          {title && <span className='actionTitle'>{title}</span>}
        </span>
      </CSSTransition>
    </div>
  )
}

export default CopyButton
