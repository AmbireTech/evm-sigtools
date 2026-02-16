import React from 'react'
import { FaInfo } from 'react-icons/fa'

const InfoAlert = ({ text, className }) => {
  return (
    <div className='instructions'>
      <span className='instructions-icon'>
        <FaInfo />
      </span>
      <span className='instructions-text'>{text}</span>
    </div>
  )
}

export default InfoAlert
