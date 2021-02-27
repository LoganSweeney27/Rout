import PropTypes from 'prop-types'

const Header = ({ title }) => {
    return (
        <header>
            <h1 /*style={headingStyle}*/>Hello {title} this is Rout</h1>
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