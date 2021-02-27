import PropTypes from 'prop-types'
import Button from './Button'

const Header = ({ title }) => {
    //Function used to change use of clicking on buttons.
    const onClick = (e) => {
        console.log(e)
    }

    return (
        <header className='header'>
            <h1 /*style={headingStyle}*/>Hello {title} this is Rout</h1>
            <Button text='Button' onClick={onClick} />
        </header>
    )
}

// CSS in JS
// const headingStyle = {
//     color: 'blue',
//     backgroundColor: 'black'
// }

Header.defaultProps = {
    title: 'User',
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
}

export default Header