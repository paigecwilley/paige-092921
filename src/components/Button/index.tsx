import React from 'react'
import './index.css'

interface ButtonProps {
  action: () => void
  text: string
}

const Button = ({ action, text }: ButtonProps): React.ReactElement => {
  return (
    <button className="button-styles" onClick={() => action()}>
      {text}
    </button>
  )
}

export default Button
