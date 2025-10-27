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

        // check both ? and # for token (covers both Spotify flows)
        const access_token = params.get('access_token') || hash.get('access_token');

        //  check if Spotify sent an expiry time, default 1 hour (3600s)
        const expires_in = Number(params.get('expires_in') || hash.get('expires_in') || 3600);

        // check for token
        if (access_token) {
            // Save token and optional expiry info
            localStorage.setItem('spotify_access_token', access_token);

            // remove token from the URL bar for security
            window.history.replaceState(null, document.title, window.location.pathname); // <-- added

            // store expiration timestamp (optional)
            localStorage.setItem(
                'spotify_access_token_meta',
                JSON.stringify({ exp: Date.now() + expires_in * 1000 }) // token expires in given time or 1 hour
            );

            console.log('Token saved!');

            // small delay before redirecting to /transfer
            const id = setTimeout(() => navigate('/transfer', { replace: true }), 300);
            return () => clearTimeout(id);
        } 
        else {
            console.log('No access token in URL.');
            navigate('/', { replace: true });
        }

        // make sure we got it
        console.log('Token ' + access_token);
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
