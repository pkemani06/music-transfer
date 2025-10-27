/*
login page -> spotify website -
*/
// use effect for actions
import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function Callback() {
    const navigate = useNavigate();
    useEffect (() => {
        // getting URL parameters
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get('access_token');

        if (access_token) {
        localStorage.setItem('spotify_access_token', access_token);
        window.history.replaceState(null, document.title, window.location.pathname); // <-- added
        localStorage.setItem(
            'spotify_access_token_meta',
            JSON.stringify({ exp: Date.now() + 3600 * 1000 })
        );

        const id = setTimeout(() => navigate('/transfer', { replace: true }), 300);
        return () => clearTimeout(id);
        } else {
        console.log('No access token in URL.');
        navigate('/', { replace: true });
        }
    }, [navigate]);
    return (
        <div style = {styles.container}>
            <h1>Processing your login...</h1>
            <p>Please wait, we're getting your Spotify data!</p>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'white',
        background: 'linear-gradient(180deg, #1DB954 0%, #191414 100%)',
        fontFamily: 'Arial, sans-serif'
    }
};

export default Callback;