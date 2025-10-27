import React, { useState } from 'react';
// importing the spotify icon (react has a icon library)
import { FaSpotify, FaCompactDisc } from 'react-icons/fa'; 
// gi is game icons
import './Login.css'

// function component
function Login() {
    // use state is creating a piece of memory that starts with the value false saying its not hovering yet
    const [isHovered, setIsHovered] = useState(false)
    // arrow syntax is not needed? but i get an error without it 
    const handleSpotifyLogin = () =>{
        window.location.href = 'https://music-transfer-server.onrender.com/login';
    };
    return (
        // visual part
        <div style = {styles.container}>
            <FaCompactDisc style={styles.vinyl} className="vinyl-spin" />
            <FaSpotify style = {styles.spotifyIcon} className = 'spotify-icon-animated'/>
            <h1 style = {styles.title}>Music Transfer!</h1>
            <p style = {styles.subtitle}>Transfer your playlist from spotify to apple music!</p>
            <button 
                onClick = {handleSpotifyLogin} 
                // terinary operator (same like the c++)
                // if hovering the hover else dont hover 
                style = {isHovered ? styles.buttonHover : styles.button}
                onMouseEnter = {() => setIsHovered(true)}
                onMouseLeave = {() => setIsHovered(false)}
            >
                Login into Spotify!
            </button>
        </div>
    );

}

const styles = {
    container:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'white',
        background: 'linear-gradient(180deg, #1DB954 0%, #191414 100%)',
        fontFamily: 'Arial, sans-serif'
    },

    title:{
        fontSize: '48px',
        marginBottom: '10px'
    },

    subtitle: {
        fontSize: '18px',
        marginBottom: '40px'
    },

    button: {
        backgroundColor: '#191414',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        fontSize: '18px',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        // smooth instead of sharp changes
        transition: 'all 0.3s ease',
        boxShadow: '0px 10px 15px rgba(0,0,0,0.3)'
    },

    spotifyIcon: {
        // control appearance
        marginRight: '10px',
        fontSize: '100px'
    },

    buttonHover: {
        backgroundColor: '#1DB954',  // Changes to green!
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        fontSize: '18px',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // inc the size
        transform: 'scale(1.1)',  
        // makes smooth changes instead of sharpe ones
        transition: 'all 0.3s ease',
        boxShadow: '2px 8px 15px rgba(29,185,8,0.4)'
    },

    vinyl: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    fontSize: '110px',
    color: '#191414',
    opacity: 0.7
    }
};

// make this available in other files
export default  Login;