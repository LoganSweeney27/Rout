import React from 'react'
import './Button.css'

const STYLES = ['btn--primary', 'btn--outline', 'btn--input', 'btn--lightbulb', 'btn--details', 'btn--weather', 'btn--regular', 'btn--logout']
const SIZES = ['btn--medium', 'btn--medium_dark', 'btn--large', 'btn--mobile', 'btn--wide']
const COLOR = ['primary', 'darkmode']

export const Button = ({children, type, onClick, buttonStyle, buttonSize, buttonColor}) => {
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0]
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0]
    const checkButtonColor = COLOR.includes(buttonColor) ? buttonColor : null

    return (
        <button className={`btn ${checkButtonStyle} ${checkButtonSize} ${checkButtonColor}`} onClick={onClick} type={type}>
            {children}
        </button>
    )
}