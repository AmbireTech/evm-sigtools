// Modified from Ambire Wallet component
import './DropDown.scss'

import { useEffect, useRef, useState } from 'react'
import { BsChevronDown } from 'react-icons/bs'
import useOnClickOutside from '../../hooks/onClickOutside'

export default function DropDown({
                                   children,
                                   id,
                                   className,
                                   title,
                                   open,
                                   closeOnClick,
                                   onChange,
                                   onOpen,
                                   onClose,
                                   style
                                 }) {

  const ref = useRef()
  const transitionRef = useRef()
  const [isMenuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(open), [open])
  useEffect(() => onChange && onChange(isMenuOpen), [onChange, isMenuOpen])
  useEffect(() => {
    return () => {
      return !isMenuOpen && onClose && onClose()
    }
  }, [isMenuOpen, onClose])

  useEffect(() => {
    return () => {
      return isMenuOpen && onOpen && onOpen()
    }
  }, [isMenuOpen, onOpen])
  useOnClickOutside(ref, () => setMenuOpen(false))

  return (
    <div id={id} style={style} className={`dropdown ${className || ''} ${isMenuOpen ? 'open' : ''}`} ref={ref}>
      <div className='content' onClick={() => setMenuOpen(!isMenuOpen)}>
        <div className='title'>{title}</div>
        <div className='separator'></div>
        <div className={`handle ${isMenuOpen ? 'open' : ''}`}>
          <BsChevronDown size={20}></BsChevronDown>
        </div>
      </div>
      {
        isMenuOpen &&
        <div className='menu' ref={transitionRef} onClick={closeOnClick ? () => setMenuOpen(false) : null}>
          {children}
        </div>
      }
    </div>
  )
}
